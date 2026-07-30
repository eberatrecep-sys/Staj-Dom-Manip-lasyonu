import os
import glob

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    if "using Asp.Versioning;" not in content:
        content = "using Asp.Versioning;\n" + content

    content = content.replace('[Route("api/auth")]', '[ApiVersion("1.0")]\n[Route("api/v{version:apiVersion}/auth")]')
    content = content.replace('[Route("api/shopping-list")]', '[ApiVersion("1.0")]\n[Route("api/v{version:apiVersion}/shopping-list")]')
    content = content.replace('[Route("api/share")]', '[ApiVersion("1.0")]\n[Route("api/v{version:apiVersion}/share")]')
    content = content.replace('[Route("api/admin")]', '[ApiVersion("1.0")]\n[Route("api/v{version:apiVersion}/admin")]')
    content = content.replace('[Route("api/settings")]', '[ApiVersion("1.0")]\n[Route("api/v{version:apiVersion}/settings")]')
    
    # Currency is special, Route("api") but inside it has [HttpGet("currency/rates")] etc.
    content = content.replace('[Route("api")]', '[ApiVersion("1.0")]\n[Route("api/v{version:apiVersion}")]')

    with open(filepath, 'w') as f:
        f.write(content)

for filepath in glob.glob('/Users/ekremberatrecep/Desktop/staj/DOM Manipülasyonu/MyShoppingApp/src/MyShoppingApp.API/Controllers/*.cs'):
    process_file(filepath)
    print(f"Processed {filepath}")
