# Advanced Machine Learning Strategy for TradingView

This Pine Script `strategy` uses a simplified machine learning model to analyze market conditions, generate trading signals, and execute a backtest on your chart. It is designed to be adaptive, adjusting its internal logic based on whether the market is trending or ranging.

## How to Use

1.  **Open TradingView:** Log in to your TradingView account.
2.  **Open the Pine Editor:** Click on the "Pine Editor" tab at the bottom of the chart.
3.  **Copy the Code:** Copy the entire content of the `ML_Indicator.pine` file.
4.  **Paste into the Pine Editor:** Paste the code into the Pine Editor, replacing any default content.
5.  **Add to Chart:** Click the "Add to Chart" button. The strategy will be applied to your chart, and you can view the backtest results in the "Strategy Tester" tab.

## Advanced Features

*   **Expanded Feature Set:** The model analyzes a wide range of inputs, including:
    *   Price Change & High-Low Range
    *   Volume Change
    *   RSI, MACD, and Stochastic oscillators
    *   Price position within Bollinger Bands
    *   Average True Range (ATR) for volatility
*   **Adaptive Weighting:** The strategy uses the Average Directional Index (ADX) to determine if the market is **trending** or **ranging**. It then dynamically adjusts the weights of the features above to prioritize momentum indicators in a trend and mean-reversion indicators in a range.
*   **Visual Market Regime:** The chart's background will be shaded **green** when the model detects a trending market and **orange** when it detects a ranging market.

## Strategy & Risk Management Settings

*   **Lookback Period:** The number of historical bars for calculations.
*   **Buy/Sell Thresholds:** The sentiment score levels (0-1) required to trigger a trade.
*   **ADX Trend Threshold:** The ADX level above which the market is considered to be trending.
*   **Stop Loss (%):** The percentage below the entry price at which a long position (or above for a short) will be automatically closed to limit losses.
*   **Take Profit (%):** The percentage above the entry price (or below for a short) at which a position will be automatically closed to secure profits.

## How to Interpret the Backtest

After adding the strategy to your chart, click on the **"Strategy Tester"** tab at the bottom of the screen. Here you can find detailed performance metrics, including:
*   Net Profit
*   Profit Factor
*   Win Rate
*   Drawdown
*   A full list of all trades executed.

## Disclaimer

This strategy is for educational and research purposes only and should not be considered financial advice. The model uses a heuristic (non-optimized) set of weights, and past performance is not indicative of future results. Always conduct your own thorough backtesting and risk assessment before trading.
