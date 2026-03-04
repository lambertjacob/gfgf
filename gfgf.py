from flask import Flask, request, jsonify
from flask_cors import CORS
import anthropic, time, json
from datetime import date

app = Flask(__name__)
CORS(app)

usage_log = {"date": "", "count": 0}
DAILY_LIMIT = 1

def is_rate_limited():
    today = str(date.today())
    if usage_log["date"] != today:
        usage_log["date"] = today
        usage_log["count"] = 0
    if usage_log["count"] >= DAILY_LIMIT:
        return True
    usage_log["count"] += 1
    return False

client = anthropic.Anthropic()


def call_claude(messages, system="only serve facts, no opinions, and make NO mistakes on the gluten-free status."):
    try:
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=1024,
            system=system  
            messages=messages
        )
        return response.content[0].text
    except anthropic.APIConnectionError:
        print("Connection failed, retrying...")
    except anthropic.RateLimitError:
        print("Rate limited — wait and retry")
    except anthropic.APIStatusError as e:
        print(f"API error: {e.status_code}")

def run_step(name, prompt, history):
    print(f"Running step: {name}")
    start = time.time()
    history.append({"role": "user", "content": prompt})
    response = call_claude(history)
    history.append({"role": "assistant", "content": response})
    end = time.time()
    print(f"Response for {name}: {response}")
    print(f"Step '{name}' completed in {end - start:.2f} seconds.")
    return response


@app.route('/recipe', methods=['POST'])
def run_workflow():
    if is_rate_limited():
        return jsonify({"error": "Only one recipe can be generated per day"}), 429

    ingredients = request.json.get("ingredients")
    if not ingredients:
        return jsonify({"error": "No ingredients provided"}), 400
    
    history = [] 
    
    check_ingredients = run_step("Check Ingredients", f"Ensure that all of the following are gluten-free: {ingredients}. If any of them are not, return a list of the non-gluten-free ingredients, as this will be used in the next step.", history)
    generate_recipe = run_step("Generate Recipe", f"Generate a recipe using the following gluten-free ingredients: {ingredients} without the following {check_ingredients}. Return the recipe in a list format with the name of the dish, the ingredients, and the instructions.", history)
    nutrition_facts = run_step("Nutrition Facts", f"Generate the nutrition facts for the following recipe you just created. Return the nutrition facts in a list format with the calories, carbs, protein, and fat.", history)
   
    final_output = run_step(
        "Final Output",
        """Return the complete recipe as valid JSON only. No extra text, no markdown, no backticks. Use this exact structure:
        {
            "dish_name": "X",
            "ingredients": ["X", "X"],
            "instructions": ["X", "X"],
            "nutrition": {
                "calories": "X",
                "carbs": "X",
                "protein": "X",
                "fat": "X"
            }
        }""",
        history
    )

    #then verify the final output is valid JSON, if not, fix it and return the corrected JSON
    try:
        parsed = json.loads(final_output)
        print(json.dumps(parsed, indent=2))
    except json.JSONDecodeError:
        print("not a clean json")

if __name__ == "__main__":
    app.run(debug=True, port=5001)