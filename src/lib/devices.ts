import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import type { DeviceRecord } from '@/lib/types';

let devices: Map<string, DeviceRecord> | null = null;

function getDevices(): Map<string, DeviceRecord> {
  if (devices) return devices;

  const filePath = path.join(process.cwd(), 'api', 'fda_ai_records.csv');
  const records = parse(fs.readFileSync(filePath, 'utf8'), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as DeviceRecord[];

  devices = new Map(
    records
      .filter((record) => record.submission_number && record.thesis !== 'Error')
      .map((record) => [record.submission_number, record])
  );
  return devices;
}

export function getDevice(id: string): DeviceRecord | null {
  return getDevices().get(id) || null;
}

export function getDeviceIds(): string[] {
  return Array.from(getDevices().keys());
}
