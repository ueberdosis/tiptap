#!/usr/bin/env bash

# Ask user what the new Demo should be called
read -p "What is the name of the new Demo? " DEMO_NAME

# remove spaces with underscores
DEMO_NAME=${DEMO_NAME// /_}

# Ask user what category the new Demo should be in (options: "Dev", "Examples", "Extensions", "Experiments", "Marks", "Nodes")
read -p "What category should the new Demo be in? (Options: Dev, Examples, Extensions, Experiments, Marks, Nodes) " DEMO_CATEGORY

if [[ ! "$DEMO_CATEGORY" =~ ^(Dev|Examples|Extensions|Experiments|Marks|Nodes)$ ]]; then
  echo "Invalid category. Please choose from: Dev, Examples, Extensions, Experiments, Marks, Nodes."
  exit 1
fi

NEW_DEMO_DIR="demos/src/$DEMO_CATEGORY/$DEMO_NAME"

# Check if the directory already exists
if [ -d "$NEW_DEMO_DIR" ]; then
  echo "Directory $NEW_DEMO_DIR already exists. Please choose a different name."
  exit 1
fi

# Copy demos/src/Examples/Default to the new directory
cp -r demos/src/Examples/Default "$NEW_DEMO_DIR"
