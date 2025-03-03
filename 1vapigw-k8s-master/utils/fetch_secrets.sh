#!/bin/bash

aws secretsmanager list-secrets --region eu-west-1 --query 'SecretList[*].Name' | grep "gatewaytest" | tr -d ' ",[]' > "$HOME/filtered_file.txt"

echo "{" > "$HOME/secrets_values.json"

while read -r secret_name; do
    secret_value=$(aws secretsmanager get-secret-value --region eu-west-1 --secret-id "$secret_name" --query SecretString --output text 2>/dev/null)

    if [ $? -eq 0 ]; then
        echo "  \"$secret_name\": \"$secret_value\"," >> "$HOME/secrets_values.json"
    else
        echo "Failed to fetch secret: $secret_name"
    fi
done < "$HOME/filtered_file.txt"

echo "}" >> "$HOME/secrets_values.json"
sed -e ':a' -e '$!N; s/,\n}/\n}/; ta' -e 'P;D' "$HOME/secrets_values.json"  >  "$HOME/secrets.json" 
