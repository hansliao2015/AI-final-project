# Interactive Mapgen

## Installation

Install the required packages:

```bash
cd interactive-mapgen
pnpm install
```


Create a `.env` file inside the `interactive-mapgen` directory and add your API key:

```bash
# Note: This file is used for local development and should be ignored by Git via .gitignore
VITE_GROK_API_KEY="your-api-key-here"
```


Install [Mapgen4](https://github.com/redblobgames/mapgen4/) and follow [their instructions](https://github.com/redblobgames/mapgen4/?tab=readme-ov-file#install) to build it:

```bash
git clone https://github.com/redblobgames/mapgen4.git ./src/lib/mapgen4
cd src/lib/mapgen4

# Copied from Mapgen4 README, you can use either `npm` or `pnpm`.
npm install -g esbuild
npm install
./build.sh
```

Copy the `src/lib/mapgen4/build` directory to the `public` directory in this project:

```bash
cp -r ./build ../../../public/build
```

Then, go back to the root directory of this project:

```bash
cd ../../..
```

## Usage

Run the development server:

```bash
pnpm run dev
```
