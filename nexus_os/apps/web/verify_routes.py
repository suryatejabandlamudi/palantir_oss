
import urllib.request
import urllib.error

base_url = "http://localhost:3000"
routes = [
    "/",
    "/login",
    "/workspace",
    "/gotham",
    "/foundry",
    "/ontology",
    "/warp",
    "/apollo",
    "/erp",
    "/crm",
    "/hcm",
    "/itsm",
    "/supply-chain",
    "/ciso",
    "/autobidder",
    "/garage",
    "/builder",
    "/protocols",
    "/command-center",
    "/aip"
]

print(f"{'ROUTE':<20} | {'STATUS':<10} | {'MESSAGE'}")
print("-" * 50)

for route in routes:
    url = f"{base_url}{route}"
    try:
        with urllib.request.urlopen(url) as response:
            print(f"{route:<20} | {response.getcode():<10} | OK")
    except urllib.error.HTTPError as e:
        print(f"{route:<20} | {e.code:<10} | {e.reason}")
    except urllib.error.URLError as e:
        print(f"{route:<20} | {'ERR':<10} | {e.reason}")
    except Exception as e:
        print(f"{route:<20} | {'ERR':<10} | {e}")
