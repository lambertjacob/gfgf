import anthropic

client = anthropic.Anthropic()

def call_claude(prompt, system="only serve facts, no opinions, and make NO mistakes on the gluten-free status."):
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        system=system,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text

def run_workflow(ingredients):
    check_ingredients = call_claude(f"Ensure that all of the following are gluten-free: {ingredients}. If any of them are not, return a list of the non-gluten-free ingredientsm as this will be used in the next step.")
    print("Check Ingredients:", check_ingredients)
    generate_recipe = call_claude(f"Generate a recipe using the following gluten-free ingredients: {ingredients} without the following {check_ingredients}. Return the recipe in a list format with the name of the dish, the ingredients, and the instructions.")
    print("Generate Recipe:", generate_recipe)
    nurtition_facts = call_claude(f"Generate the nutrition facts for the following recipe: {generate_recipe}. Return the nutrition facts in a list format with the calories, carbs, protein, and fat.")
    generate_output = call_claude(f"Generate a final output that includes the recipe and the nutrition facts for the following recipe: {generate_recipe} with the following nutrition facts: {nurtition_facts}. Return the output in a list format with the name of the dish, the ingredients, the instructions, and the nutrition facts.")

    print(generate_output)


run_workflow("kale, chicken, rice, soy sauce, gluten-free pasta, oatmeal")