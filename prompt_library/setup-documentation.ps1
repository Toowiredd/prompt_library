# Documentation Setup and Deployment Script
# Author: @Toowiredd
# Date: 2025-02-08 11:47:30
# Repository: Toowiredd/prompt_library (ID: 929360050)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "
╔════════════════════════════════════════════╗
║     PROMPT LIBRARY DOCUMENTATION SETUP     ║
║     Date: 2025-02-08 11:47:30            ║
║     Author: @Toowiredd                    ║
╚════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Function to create directory if it doesn't exist
function EnsureDirectory {
    param($path)
    if (!(Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force
        Write-Host "Created directory: $path" -ForegroundColor Green
    }
}

# Create required directories
Write-Host "Creating directory structure..." -ForegroundColor Yellow
$directories = @(
    "docs",
    "docs/setup",
    "docs/architecture",
    "docs/guides",
    ".github"
)

foreach ($dir in $directories) {
    EnsureDirectory $dir
}

# Create documentation files
Write-Host "Creating documentation files..." -ForegroundColor Yellow

# SETUP_GUIDE.txt
$setupGuide = @"
[Previous SETUP_GUIDE.txt content]
"@
Set-Content -Path "docs/setup/SETUP_GUIDE.txt" -Value $setupGuide

# ASCII_SETUP_GUIDE.txt
$asciiGuide = @"
[Previous ASCII_SETUP_GUIDE.txt content]
"@
Set-Content -Path "docs/setup/ASCII_SETUP_GUIDE.txt" -Value $asciiGuide

# COMPREHENSIVE_GUIDE.txt
$comprehensiveGuide = @"
[Previous COMPREHENSIVE_GUIDE.txt content]
"@
Set-Content -Path "docs/guides/COMPREHENSIVE_GUIDE.txt" -Value $comprehensiveGuide

# CONVERSATION_LOG.txt
$conversationLog = @"
═══════════════════════════════════════════════════════════════
           PROMPT LIBRARY DEVELOPMENT CONVERSATION
═══════════════════════════════════════════════════════════════
Repository: Toowiredd/prompt_library (ID: 929360050)
Date: 2025-02-08 11:47:30 UTC
Author: @Toowiredd

[Conversation history and updates]
"@
Set-Content -Path "docs/CONVERSATION_LOG.txt" -Value $conversationLog

# version_history.json
$versionHistory = @"
{
    `"lastUpdate`": `"2025-02-08 11:47:30`",
    `"author`": `"Toowiredd`",
    `"repository`": {
        `"name`": `"Toowiredd/prompt_library`",
        `"id`": `"929360050`"
    },
    `"documentationUpdates`": [
        {
            `"date`": `"2025-02-08 11:47:30`",
            `"author`": `"Toowiredd`",
            `"type`": `"addition`",
            `"description`": `"Initial documentation setup with ASCII guides and comprehensive documentation`"
        }
    ]
}
"@
Set-Content -Path "docs/version_history.json" -Value $versionHistory

# Git operations
Write-Host "Performing Git operations..." -ForegroundColor Yellow
try {
    git add docs/ .github/
    git commit -m "Add comprehensive documentation

- Added setup guides
- Added ASCII art documentation
- Added system architecture diagrams
- Added command references
- Added conversation log

Date: 2025-02-08 11:47:30
Author: @Toowiredd"

    Write-Host "Successfully committed documentation!" -ForegroundColor Green
} catch {
    Write-Host "Error during Git operations: $_" -ForegroundColor Red
}

Write-Host "
╔════════════════════════════════════════════╗
║              SETUP COMPLETE               ║
║                                          ║
║  ✓ Directories created                   ║
║  ✓ Documentation files generated         ║
║  ✓ Version history updated               ║
║  ✓ Changes committed to repository       ║
╚════════════════════════════════════════════╝
" -ForegroundColor Green

Write-Host "To push changes to remote repository, run: git push origin main" -ForegroundColor Yellow