# RiceHub website

Repository containing the source code of [RiceHub.io](https://ricehub.io) website.
It's written in TypeScript using [PreactJS](https://preactjs.com/) which is nearly identical to ReactJS but more performant.

If you're interested in building the website for youself, you can do so by following the steps in [building](#building) section below.
To get started with contributing please check the [contributing](#contributing) section.

## [Building](#building)

### Prerequisites

Before you can build the project you need to have installed these prerequisites on your computer to proceed:

- Latest or LTS [NodeJS](https://nodejs.org/en/download) installed
- [pnpm](https://pnpm.io/installation) package manager installer
- Working instance of the [RiceHub API](https://github.com/ricehub-io/api)

### Steps

1. Clone the repository:

```bash
$ git clone https://github.com/ricehub-io/website.git ricehub-website
$ cd ricehub-website
```

2. Install dependencies

````bash
$ pnpm i
---

3. Start the development server
```bash
$ pnpm dev
````

Now the website will be accessible at http://127.0.0.1:3000

If you want to build the website instead of running a development server you can simply run:

```bash
$ pnpm build
```

Then you can find the built website in `dist/` directory.

**Note:**
To change the API URL (by default its set to 127.0.0.1:3000) you need to create a `config.js` file after building the website and place it in the same directory as `index.html` is. Example config file:

```javascript
window.__APP_CONFIG__ = {
    API_URL: "https://api.ricehub.io",
};
```

## [Contributing](#contributing)

If you're interested in contributing to the project, please first get yourself informed with the [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
Then check out the [CONTRIBUTING.md] file which contains all the important information on how to contribute.

If your question is still unanswered, feel free to open an issue or ask on Discord server (link provided below).

## Contact

If you need to contact us, you can do so either by sending us an email to [contact@ricehub.io](mailto:contact@ricehub.io) or via Discord server: https://discord.gg/z7Zu8MeTdG

## Favicon

Favicon is not made nor owned by RiceHub. It's taken from [this repo](https://github.com/garrett/Tux) and modified to our needs.
