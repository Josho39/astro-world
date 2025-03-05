import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';

interface CandleData {
  timestamp: string;
  ticker: string;
  open: string;
  high: string;
  low: string;
  close: string;
  open_kas?: string;
  high_kas?: string;
  low_kas?: string;
  close_kas?: string;
}

interface ChartData {
  candles: CandleData[];
}

interface TradingViewChartProps {
  ticker: string;
  timeRange?: '1d' | '7d' | '1m' | '1y';
  priceType?: 'usd' | 'kas';
}

declare global {
  interface Window {
    tvWidget: any;
    TradingView: any;
  }
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  ticker,
  timeRange = '1d',
  priceType = 'usd'
}) => {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInitialized = useRef<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getTVTheme = () => {
    if (!mounted) return 'Dark';
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chart-data?ticker=${ticker}&timeRange=${timeRange}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.candles || !Array.isArray(data.candles)) {
        throw new Error('Invalid data format returned from API');
      }

      if (data.candles.length === 0) {
        throw new Error(`No candle data available for ${ticker} with ${timeRange} time range`);
      }

      setChartData(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const processCandles = (data: ChartData) => {
    try {
      if (!data.candles || data.candles.length === 0) {
        return [];
      }
      const bars = data.candles.map(candle => {
        try {
          const timestamp = new Date(candle.timestamp).getTime();

          const open = priceType === 'kas' && candle.open_kas
            ? parseFloat(candle.open_kas) || 0
            : parseFloat(candle.open) || 0;

          const high = priceType === 'kas' && candle.high_kas
            ? parseFloat(candle.high_kas) || 0
            : parseFloat(candle.high) || 0;

          const low = priceType === 'kas' && candle.low_kas
            ? parseFloat(candle.low_kas) || 0
            : parseFloat(candle.low) || 0;

          const close = priceType === 'kas' && candle.close_kas
            ? parseFloat(candle.close_kas) || 0
            : parseFloat(candle.close) || 0;

          return {
            time: timestamp,
            open: open,
            high: high,
            low: low,
            close: close,
            volume: 0
          };
        } catch (e) {
          return null;
        }
      }).filter(bar => bar !== null);

      bars.sort((a, b) => a.time - b.time);

      return bars;
    } catch (error) {
      return [];
    }
  };

  const createDatafeed = (data: ChartData) => {
    const allBars = processCandles(data);

    const firstTime = allBars.length > 0 ? allBars[0].time : 0;
    const lastTime = allBars.length > 0 ? allBars[allBars.length - 1].time : 0;

    return {
      onReady: (callback: (config: any) => void) => {
        setTimeout(() => callback({
          supported_resolutions: ['60'],
          supports_time: true,
          supports_marks: false,
          supports_timescale_marks: false
        }), 0);
      },
      searchSymbols: () => { },
      resolveSymbol: (symbolName: string, onSymbolResolvedCallback: (symbolInfo: any) => void) => {
        setTimeout(() => {
          onSymbolResolvedCallback({
            name: symbolName + (priceType === 'kas' ? '/KAS' : '/USD'),
            full_name: symbolName + (priceType === 'kas' ? '/KAS' : '/USD'),
            description: symbolName + (priceType === 'kas' ? ' in KAS' : ' in USD'),
            type: 'crypto',
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: '',
            minmov: 1,
            pricescale: priceType === 'kas' ? 1000000 : 100000000,
            has_intraday: true,
            has_daily: true,
            has_weekly_and_monthly: true,
            supported_resolutions: ['60'],
            volume_precision: 8,
            data_status: 'streaming',
            first_data_at: firstTime / 1000,
            last_data_at: lastTime / 1000,
          });
        }, 0);
      },
      getBars: (symbolInfo: any, resolution: string, periodParams: any, onHistoryCallback: any, onErrorCallback: any) => {
        try {
          const from = periodParams.from * 1000;
          const to = periodParams.to * 1000;

          if (to < firstTime) {
            onHistoryCallback([], { noData: true });
            return;
          }

          if (from > lastTime) {
            onHistoryCallback([], { noData: true });
            return;
          }

          const filteredBars = allBars.filter(bar => bar.time >= from && bar.time <= to);

          if (filteredBars.length === 0) {
            onHistoryCallback([], { noData: true });
            return;
          }

          onHistoryCallback(filteredBars, { noData: false });
        } catch (error) {
          onErrorCallback(error);
        }
      },
      subscribeBars: () => { },
      unsubscribeBars: () => { }
    };
  };

  useEffect(() => {
    if (!mounted) return;

    const loadLibraries = () => {
      return new Promise<void>((resolve) => {
        if (window.TradingView) {
          resolve();
          return;
        }

        const script1 = document.createElement('script');
        script1.src = "/charting_library/charting_library.standalone.js";
        script1.async = true;

        const script2 = document.createElement('script');
        script2.src = "/datafeeds/udf/dist/bundle.js";
        script2.async = true;

        let loadedCount = 0;
        const onScriptLoad = () => {
          loadedCount++;
          if (loadedCount === 2) {
            resolve();
          }
        };

        script1.addEventListener('load', onScriptLoad);
        script2.addEventListener('load', onScriptLoad);

        document.head.appendChild(script1);
        document.head.appendChild(script2);
      });
    };

    const cleanupChart = () => {
      if (window.tvWidget) {
        window.tvWidget.remove();
        window.tvWidget = null;
      }
      chartInitialized.current = false;
    };

    const initializeChart = async () => {
      if (chartInitialized.current) {
        cleanupChart();
      }

      try {
        await loadLibraries();

        const data = await fetchChartData();
        if (!data) return;

        if (!containerRef.current) {
          setError("Chart container not found");
          return;
        }

        const datafeed = createDatafeed(data);
        const currentTheme = getTVTheme();

        window.tvWidget = new window.TradingView.widget({
          debug: true,
          symbol: ticker + (priceType === 'kas' ? '/KAS' : '/USD'),
          interval: '60',
          container: containerRef.current,
          datafeed: datafeed,
          library_path: '/charting_library/',
          locale: 'en',
          theme: currentTheme,
          autosize: true,
          disabled_features: [
            'use_localstorage_for_settings',
            'header_compare',
            'header_symbol_search',
            'header_saveload',
            'show_object_tree',
            'edit_buttons_in_legend',
            'border_around_the_chart',
          ],
          enabled_features: [
            'create_volume_indicator_by_default',
            'volume_force_overlay'
          ],
          time_frames: [
            { text: "1D", resolution: "60", description: "1 Day" },
            { text: "1W", resolution: "60", description: "1 Week" },
            { text: "1M", resolution: "60", description: "1 Month" },
            { text: "1Y", resolution: "60", description: "1 Year" },
          ],
          charts_storage_url: 'https://saveload.tradingview.com',
          charts_storage_api_version: '1.1',
          client_id: 'tradingview.com',
          user_id: 'public_user_id'
        });

        window.tvWidget.onChartReady(() => {
          window.tvWidget.chart().createStudy('Volume', true, false, undefined, {
            'showLabelsOnPriceScale': false
          });

          const chart = window.tvWidget.chart();
          const lastBar = data.candles[data.candles.length - 1];
          if (lastBar) {
            const endTime = new Date(lastBar.timestamp).getTime() / 1000;
            let startTime;

            switch (timeRange) {
              case '1d':
                startTime = endTime - (24 * 60 * 60);
                break;
              case '7d':
                startTime = endTime - (7 * 24 * 60 * 60);
                break;
              case '1m':
                startTime = endTime - (30 * 24 * 60 * 60);
                break;
              case '1y':
                startTime = endTime - (365 * 24 * 60 * 60);
                break;
              default:
                startTime = endTime - (24 * 60 * 60);
            }

            chart.setVisibleRange({
              from: startTime,
              to: endTime
            });
          }

          setTimeout(() => {
            const iframe = containerRef.current?.querySelector('iframe');
            if (iframe) {
              iframe.style.height = "100%";
            }
          }, 100);
        });

        chartInitialized.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize chart');
      }
    };

    initializeChart();

    return () => {
      cleanupChart();
    };
  }, [ticker, timeRange, priceType, theme, mounted]);

  if (!mounted) {
    return <div className="w-full h-full bg-background"></div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-muted text-foreground p-1 rounded-lg">
        <div className="text-center">
          <p className="font-bold text-destructive">Error loading chart</p>
          <p>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              fetchChartData();
            }}
            className="mt-1 px-4 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full"></div>
    </div>
  );
};

export default TradingViewChart;