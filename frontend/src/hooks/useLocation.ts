import { useState, useEffect, useRef } from 'react';
import { encode } from '../utils/geohash';

/**
 * 位置情報と乗車判定を保持するステート
 */
export interface LocationState {
  lat: number;           // 緯度
  lng: number;           // 経度
  speed: number;         // 速度 (m/s)
  heading: number;       // 方位 (0–360°)
  roomId: string;        // ルームID (geohash_方向量子化)
  isRiding: boolean;     // 電車に乗車中かのフラグ
}

// 地球上の2点間距離を求める（m）Haversine 公式
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000; // 地球半径(m)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 方位（bearing）を求める（deg）
function bearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * カスタムフック：1秒ごとに Geolocation API で位置を取得し、
 * 速度閾値で乗車判定、ジオハッシュ＋方位から roomId を生成
 */
export function useLocation(): LocationState {
  const [loc, setLoc] = useState<LocationState>({
    lat: 0,
    lng: 0,
    speed: 0,
    heading: 0,
    roomId: '',
    isRiding: false,
  });

  // 前回の位置と時刻を保持
  const prevRef = useRef<{ lat: number; lng: number; time: number } | null>(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const now = Date.now();
          const { latitude, longitude } = coords;
          let speed = 0;
          let head = 0;

          if (prevRef.current) {
            const dt = (now - prevRef.current.time) / 1000; // 秒
            const dist = haversine(
              prevRef.current.lat,
              prevRef.current.lng,
              latitude,
              longitude
            );
            speed = dist / dt;
            head = bearing(
              prevRef.current.lat,
              prevRef.current.lng,
              latitude,
              longitude
            );
          }

          // 次回計算用に保存
          prevRef.current = { lat: latitude, lng: longitude, time: now };

          const riding = speed > 2; // 2 m/s ≒ 7.2 km/h
          //const riding = true;  //デバック用
          const gh = encode(latitude, longitude);
          const dir = Math.floor(head / 45) * 45; // 8方向量子化

          setLoc({
            lat: latitude,
            lng: longitude,
            speed,
            heading: head,
            roomId: `${gh}_${dir}`,
            isRiding: riding,
          });
        },
        (err) => console.error('位置取得エラー', err.code, err.message),
        { enableHighAccuracy: false }
      );
    }, 1000);

    return () => {
      clearInterval(intervalId);
      prevRef.current = null;
    };
  }, []);

  return loc;
}