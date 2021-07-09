# Trading AI

Your stock trading companion, powered by AI.

This app can help you with trading stocks. You can view stock prices and indicators, set alerts when the prices rise or fall, and use our prediction algorithm to get the forecast price. Trading has never been this easy!

[Installation](#installation)

## Features

These are some of the features of Trading AI.

### Dashboard

View the stock prices at different ranges, as well as various indicators including WMA, SMA, VWAP, and RSI.

![](https://chamburr.xyz/u/znq6l7.png)

### Alert Me

Get a notification when the stock price hit your target price, with an option to automatically renew the alert.

![](https://chamburr.xyz/u/uK5EQO.png)

### Predict

Predict the stock price through training a model with our algorithm, powered by machine learning.

![](https://chamburr.xyz/u/Zn9X4q.png)

## Building

You can install Node.js and Yarn to build the app.

Then, install the dependencies with `yarn` and run `yarn start` for development or `yarn build` for production.

## Installation

You can download the pre-built inaries for Mac and Windows on the releases page [here](https://github.com/chamburr/trading-ai/releases).

These binaries are unsigned, and you will need to perform the steps below.

### Mac

1. Open the file and move `Trading AI.app` to the Applications folder.
2. Install Xcode Command Line Tools with `xcode-select --install` if you have not previously installed it.
3. Open a terminal and run the following commands.
  ```sh
  xattr -cr /Applications/Trading\ AI.app
  codesign -s - -f --deep /Applications/Trading\ AI.app
  ```
4. Launch Trading AI. Done!

### Windows

1. Enable Developer Mode in Settings > Updates & Security > For Developers.
2. Open `Trading AI Setup.exe` and click Allow for all prompts.
3. Launch Trading AI Done!

## License

This project is licensed under the [MIT License](LICENSE).
