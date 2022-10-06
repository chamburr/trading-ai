# Trading AI

Your stock trading companion, powered by AI.

This app can help you with trading stocks. You can view stock prices and indicators, set alerts when the prices rise or fall, and use our prediction algorithm to get the forecast price. Trading has never been this easy!

[Installation](#installation)

## Features

These are some of the features of Trading AI.

### Dashboard

View the stock prices at different ranges, as well as various indicators including WMA, SMA, VWAP, and RSI.

![](https://user-images.githubusercontent.com/42373024/194300468-4fcc30d5-2bb4-4872-ac5d-35ee27dc3628.png)

### Alert Me

Get a notification when the stock price hit your target price, with an option to automatically renew the alert.

![](https://user-images.githubusercontent.com/42373024/194300490-fda06e6f-8415-4961-9666-9f65cc615fc7.png)

### Predict

Predict the stock price through training a model with our algorithm, powered by machine learning.

![](https://user-images.githubusercontent.com/42373024/194300496-8842faba-a1fb-428a-a99e-92b2c85a333f.png)

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
