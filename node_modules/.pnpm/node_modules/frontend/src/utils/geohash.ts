// frontend/src/utils/geohash.ts

import Geohash from 'latlon-geohash';

/**
 * 緯度経度を geohash 文字列にエンコード
 * @param lat 緯度
 * @param lng 経度
 * @param precision 文字数（デフォルト 8）
 */
export function encode(lat: number, lng: number, precision = 8): string {
  return Geohash.encode(lat, lng, precision);
}
