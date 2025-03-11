"""
Python script to fetch all KRC20 tokens from the Kasplex API
and format them in the desired format.

Usage:
1. Save this file as fetch_kasplex_tokens.py
2. Run with: python fetch_kasplex_tokens.py
3. Tokens will be saved to "kasplex_tokens.js"
"""

import requests
import time
import json

def fetch_all_tokens():
    """Fetch all tokens from the Kasplex API with pagination"""
    all_tokens = []
    next_value = None
    has_more = True
    fetch_count = 0
    max_fetches = 100  

    print("Starting to fetch tokens...")

    while has_more and fetch_count < max_fetches:
        fetch_count += 1
        
        url = "https://api.kasplex.org/v1/krc20/tokenlist"
        if next_value:
            url += f"?next={next_value}"
        
        print(f"Fetching from: {url}")
        
        try:
            response = requests.get(url)
            response.raise_for_status()  
            
            data = response.json()
            
    
            tokens = [token["tick"] for token in data["result"]]
            all_tokens.extend(tokens)
            
            print(f"Fetched {len(tokens)} tokens. Total so far: {len(all_tokens)}")
            
            # Check if there are more tokens to fetch
            if "next" in data and data["next"]:
                next_value = data["next"]
            else:
                has_more = False
        except Exception as e:
            print(f"Error fetching tokens: {str(e)}")
            has_more = False
        
        # Small delay to prevent overwhelming the API
        if has_more:
            time.sleep(0.5)
    
    print(f"Finished fetching. Total tokens: {len(all_tokens)}")
    return all_tokens

def format_tokens(tokens):
    """Format the tokens in the desired format"""
    formatted_tokens = ",\n".join([f'    "{token}"' for token in tokens])
    return f"export const TICKERS = [\n{formatted_tokens}\n] as const;"

def main():
    """Main function"""
    try:
        tokens = fetch_all_tokens()
        formatted_output = format_tokens(tokens)
        
        # Save to file
        with open("kasplex_tokens.js", "w") as f:
            f.write(formatted_output)
        
        print(f"\nSuccessfully saved {len(tokens)} tokens to kasplex_tokens.js")
    except Exception as e:
        print(f"Error in main process: {str(e)}")

if __name__ == "__main__":
    main()