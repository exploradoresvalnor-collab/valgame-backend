import re

path = r"c:\Users\Usuario\Desktop\trabajo\Valnor-full\docs\gui a de ejempli\valgame-backend\src\routes\userPackages.routes.ts"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add import
content = content.replace("import UserPackage from '../models/UserPackage';", "import UserPackage from '../models/UserPackage';\nimport UserCharacter from '../models/userCharacter';")

# 2. currentCharacters fetch
content = content.replace(
    "const currentCharacters = user.personajes?.length || 0;",
    "const currentCharacters = await UserCharacter.countDocuments({ userId }).session(session);"
)
# 3. Use newCharacters array instead of user.personajes for pushing
content = content.replace(
    "const guaranteed = (pkg as any).categorias_garantizadas || [];",
    "const guaranteed = (pkg as any).categorias_garantizadas || [];\n    const newCharactersData: any[] = [];"
)
content = content.replace("user.personajes.push({", "newCharactersData.push({ userId,")

# 4. Save newCharactersData before user.save
content = content.replace(
    "await user.save({ session });",
    "if (newCharactersData.length > 0) await UserCharacter.insertMany(newCharactersData, { session });\n    await user.save({ session });"
)

# 5. Length replacements
content = content.replace("user.personajes.length", "currentCharacters + assigned.length")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("userPackages.routes.ts patched successfully.")
