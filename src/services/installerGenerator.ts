import { AppItem } from '../types/app';

export type WindowsScriptFormat = 'ps1' | 'bat';
export type WindowsPackageManager = 'winget' | 'choco';

export function generateWindowsInstallScript(
  apps: AppItem[],
  format: WindowsScriptFormat = 'ps1',
  manager: WindowsPackageManager = 'winget'
): { filename: string; content: string; mimeType: string } {
  const pcApps = apps.filter((a) => a.platform === 'pc');
  const timestamp = new Date().toISOString().slice(0, 10);

  if (format === 'ps1') {
    const lines: string[] = [
      '# ============================================================================',
      '# NexusDeploy — Automated Silent Software Deployment Script (PowerShell)',
      `# Generated: ${new Date().toUTCString()}`,
      '# Package Manager: ' + (manager === 'winget' ? 'Windows Package Manager (winget)' : 'Chocolatey (choco)'),
      '# Developer Signature: مع تحيات المطور Amir Lamay',
      '# ============================================================================',
      '',
      '$ErrorActionPreference = "Continue"',
      'Write-Host "Starting NexusDeploy Bulk Silent Installation..." -ForegroundColor Cyan',
      '',
    ];

    if (manager === 'winget') {
      lines.push(
        'if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {',
        '    Write-Warning "Windows Package Manager (winget) was not found on this system. Please install App Installer from Microsoft Store."',
        '    exit 1',
        '}',
        ''
      );
    } else {
      lines.push(
        'if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {',
        '    Write-Host "Installing Chocolatey Package Manager..." -ForegroundColor Yellow',
        '    Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString(\'https://community.chocolatey.org/install.ps1\'))',
        '}',
        ''
      );
    }

    pcApps.forEach((app, idx) => {
      const wingetPkg = app.wingetId || `Publisher.${app.name.replace(/[^a-zA-Z0-9]/g, '')}`;
      const chocoPkg = app.chocoId || app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      lines.push(`Write-Host "[${idx + 1}/${pcApps.length}] Installing ${app.name}..." -ForegroundColor Green`);
      if (manager === 'winget') {
        lines.push(
          `winget install --id "${wingetPkg}" -e --silent --accept-package-agreements --accept-source-agreements`
        );
      } else {
        lines.push(`choco install ${chocoPkg} -y --no-progress`);
      }
      lines.push('');
    });

    lines.push(
      'Write-Host "All selected PC packages processed successfully!" -ForegroundColor Cyan',
      'Write-Host "مع تحيات المطور Amir Lamay" -ForegroundColor Magenta',
      'Pause'
    );

    return {
      filename: `NexusDeploy-Bulk-Installer-${timestamp}.ps1`,
      content: lines.join('\r\n'),
      mimeType: 'text/plain;charset=utf-8',
    };
  }

  // Batch (.bat) format
  const batLines: string[] = [
    '@echo off',
    'chcp 65001 >nul',
    'title NexusDeploy — Automated Silent Installer',
    'echo ============================================================================',
    'echo NexusDeploy — Automated Silent Software Deployment Script (.BAT)',
    `echo Generated: ${new Date().toUTCString()}`,
    'echo مع تحيات المطور Amir Lamay',
    'echo ============================================================================',
    'echo.',
  ];

  pcApps.forEach((app, idx) => {
    const wingetPkg = app.wingetId || `Publisher.${app.name.replace(/[^a-zA-Z0-9]/g, '')}`;
    const chocoPkg = app.chocoId || app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    batLines.push(`echo [${idx + 1}/${pcApps.length}] Installing ${app.name}...`);
    if (manager === 'winget') {
      batLines.push(
        `winget install --id "${wingetPkg}" -e --silent --accept-package-agreements --accept-source-agreements`
      );
    } else {
      batLines.push(`choco install ${chocoPkg} -y`);
    }
    batLines.push('echo.');
  });

  batLines.push(
    'echo ============================================================================',
    'echo Deployment sequence finished.',
    'echo مع تحيات المطور Amir Lamay',
    'echo ============================================================================',
    'pause'
  );

  return {
    filename: `NexusDeploy-Bulk-Installer-${timestamp}.bat`,
    content: batLines.join('\r\n'),
    mimeType: 'application/x-bat;charset=utf-8',
  };
}

export function triggerScriptFileDownload(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
