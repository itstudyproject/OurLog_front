#!/bin/bash

# echo "Installing Basic of dependencies..."
# npm i 

echo "Installing dependencies..."
npm i chance luxon @fontsource/material-icons

echo "Installing dev dependencies..."
npm i -D @types/chance @types/luxon

echo "Installing postcss autoprefixer tailwindcss"
npm i -D postcss autoprefixer tailwindcss@latest daisyui@beta

echo "Installing @tailwindcss/line-clamp"
npm i -D @tailwindcss/line-clamp

echo "Installing @tailwindcss/vite"
npm i -D @tailwindcss/vite

echo "Installing @reduxjs/toolkit react-redux"
npm i -D @reduxjs/toolkit react-redux

echo "Installing react-router-dom"
npm i react-router-dom

echo "Installation complete!"
read -p "Press Enter to exit..."

# command for execution
# chmod +x iPackage.sh
# bash iPackage.sh