"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Permission } from "@/lib/permissions";
import {
  PermissionGuard,
  InfoTooltip,
} from "@/components/PermissionComponents";
import Card from "@/components/Card";
import Button from "@/components/Button";
import { Chart, registerables } from "chart.js";
import toast from "react-hot-toast";

// Register Chart.js components
if (typeof window !== "undefined") {
  Chart.register(...registerables);
}

const AIO_KEY = process.env.NEXT_PUBLIC_AIO_KEY!;
const AIO_USERNAME = process.env.NEXT_PUBLIC_AIO_USERNAME!;

interface SensorData {
  temperature: number;
  humidity: number;
  timestamp: string;
}

export default function SmartIoTPage() {
  const { t } = useTranslation();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [led1Status, setLed1Status] = useState<string>("LOADING...");
  const [led2Status, setLed2Status] = useState<string>("LOADING...");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Chart
  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    // Destroy existing chart if any
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Temperature (°C)",
            data: [],
            borderColor: "#ff5555",
            backgroundColor: "rgba(255, 85, 85, 0.25)",
            tension: 0.4,
          },
          {
            label: "Humidity (%)",
            data: [],
            borderColor: "#42aaff",
            backgroundColor: "rgba(66, 170, 255, 0.25)",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#374151",
              font: { size: 12 },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: "#6b7280" },
            grid: { color: "rgba(0, 0, 0, 0.05)" },
          },
          y: {
            ticks: { color: "#6b7280" },
            grid: { color: "rgba(0, 0, 0, 0.05)" },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);

  // Fetch latest sensor data and LED status
  const fetchLatestData = async () => {
    try {
      const [tempRes, humRes, led1Res, led2Res] = await Promise.all([
        fetch(
          `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds/temperature/data/last`,
          {
            headers: { "X-AIO-Key": AIO_KEY },
          }
        ),
        fetch(
          `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds/humidity/data/last`,
          {
            headers: { "X-AIO-Key": AIO_KEY },
          }
        ),
        fetch(
          `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds/led1control/data/last`,
          {
            headers: { "X-AIO-Key": AIO_KEY },
          }
        ),
        fetch(
          `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds/led2control/data/last`,
          {
            headers: { "X-AIO-Key": AIO_KEY },
          }
        ),
      ]);

      if (!tempRes.ok || !humRes.ok) {
        throw new Error("Failed to fetch sensor data");
      }

      const tempData = await tempRes.json();
      const humData = await humRes.json();

      const temp = parseFloat(tempData.value);
      const hum = parseFloat(humData.value);

      setTemperature(temp);
      setHumidity(hum);

      // Update LED statuses if available
      if (led1Res.ok) {
        const led1Data = await led1Res.json();
        setLed1Status(led1Data.value.toUpperCase());
      }
      if (led2Res.ok) {
        const led2Data = await led2Res.json();
        setLed2Status(led2Data.value.toUpperCase());
      }

      // Update chart
      if (chartInstanceRef.current) {
        const chart = chartInstanceRef.current;
        const timestamp = new Date().toLocaleTimeString();

        chart.data.labels?.push(timestamp);
        chart.data.datasets[0].data.push(temp);
        chart.data.datasets[1].data.push(hum);

        // Keep only last 20 data points
        if (chart.data.labels && chart.data.labels.length > 20) {
          chart.data.labels.shift();
          chart.data.datasets[0].data.shift();
          chart.data.datasets[1].data.shift();
        }

        chart.update();
      }
    } catch (error) {
      console.error("Error fetching sensor data:", error);
    }
  };

  // Control LED
  const controlLED = async (ledNumber: 1 | 2, command: "on" | "off") => {
    setIsLoading(true);
    try {
      const feedName = ledNumber === 1 ? "led1control" : "led2control";
      const response = await fetch(
        `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds/${feedName}/data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-AIO-Key": AIO_KEY,
          },
          body: JSON.stringify({ value: command }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to control LED");
      }

      if (ledNumber === 1) {
        setLed1Status(command.toUpperCase());
      } else {
        setLed2Status(command.toUpperCase());
      }

      toast.success(`LED ${ledNumber} turned ${command.toUpperCase()}`);
    } catch (error) {
      console.error("Error controlling LED:", error);
      toast.error(`Failed to control LED ${ledNumber}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount and set interval
  useEffect(() => {
    fetchLatestData();
    const interval = setInterval(fetchLatestData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <PermissionGuard permission={Permission.VIEW_DASHBOARD}>
      <div className="px-2 sm:px-0">
        {/* Header */}
        <div className="mb-3 sm:mb-4 flex items-start gap-1.5 sm:gap-2">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              Smart IoT Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Real-time monitoring and control of IoT devices
            </p>
          </div>
          <InfoTooltip text="Monitor temperature, humidity, and control LED devices in real-time" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
          {/* Temperature Card */}
          <Card
            padding="sm"
            className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
          >
            <div className="text-center">
              <p className="text-xs sm:text-sm text-red-600 font-semibold mb-1">
                Temperature
              </p>
              <div className="text-2xl sm:text-3xl font-bold text-red-700">
                {temperature !== null ? `${temperature} °C` : "-- °C"}
              </div>
            </div>
          </Card>

          {/* Humidity Card */}
          <Card
            padding="sm"
            className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200"
          >
            <div className="text-center">
              <p className="text-xs sm:text-sm text-blue-600 font-semibold mb-1">
                Humidity
              </p>
              <div className="text-2xl sm:text-3xl font-bold text-blue-700">
                {humidity !== null ? `${humidity} %` : "-- %"}
              </div>
            </div>
          </Card>

          {/* LED 1 Control */}
          <Card
            padding="sm"
            className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
          >
            <div className="text-center">
              <p className="text-xs sm:text-sm text-green-600 font-semibold mb-1">
                LED 1 Status
              </p>
              <div className="text-base sm:text-lg font-bold text-green-700 mb-2">
                {led1Status}
              </div>
              <div className="flex gap-1.5 justify-center">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white text-xs tap-target"
                  onClick={() => controlLED(1, "on")}
                  disabled={isLoading}
                >
                  ON
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs tap-target"
                  onClick={() => controlLED(1, "off")}
                  disabled={isLoading}
                >
                  OFF
                </Button>
              </div>
            </div>
          </Card>

          {/* LED 2 Control */}
          <Card
            padding="sm"
            className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200"
          >
            <div className="text-center">
              <p className="text-xs sm:text-sm text-purple-600 font-semibold mb-1">
                LED 2 Status
              </p>
              <div className="text-base sm:text-lg font-bold text-purple-700 mb-2">
                {led2Status}
              </div>
              <div className="flex gap-1.5 justify-center">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white text-xs tap-target"
                  onClick={() => controlLED(2, "on")}
                  disabled={isLoading}
                >
                  ON
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs tap-target"
                  onClick={() => controlLED(2, "off")}
                  disabled={isLoading}
                >
                  OFF
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Chart */}
        <Card padding="sm">
          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3">
            Temperature & Humidity Trends
          </h3>
          <div className="relative" style={{ height: "300px" }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </Card>
      </div>
    </PermissionGuard>
  );
}
