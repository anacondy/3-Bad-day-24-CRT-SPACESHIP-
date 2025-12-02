# Telemetry Logs Directory

This directory stores encrypted telemetry logs collected from game sessions.

## Files

- `telemetry.enc` - Encrypted log data (auto-generated)

## Purpose

Telemetry data is collected from players' devices to help identify:
- Performance issues
- Browser compatibility problems
- Device-specific bugs
- Network-related issues

All data is encrypted before storage for privacy protection.

## Format

Logs are XOR-encrypted and Base64-encoded JSON arrays containing:
- Session IDs
- Timestamps
- Device information
- Browser details
- Error reports
- Performance metrics
