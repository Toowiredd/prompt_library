# Floating Action Button Component

**Created:** 2025-02-08 11:52:54 UTC  
**Author:** @Toowiredd  
**Component Type:** Interactive UI Element  
**Framework:** SolidJS  

## Overview

The Floating Action Button (FAB) component provides a material design inspired floating action button with expandable menu options for sharing and PWA installation.

## Features

- 🎯 Animated expand/collapse functionality
- 📱 PWA install prompt integration
- 📤 Native sharing capabilities
- 🎨 Themeable through CSS variables
- 📐 Responsive design
- 🔄 Smooth animations using Motion One

## Installation

The component uses the following dependencies:
```typescript
import { createSignal, Show } from 'npm:solid-js';
import { styled } from 'npm:solid-styled-components';
import { Motion } from 'npm:@motionone/solid';
import { IoMdAdd, IoMdShare, IoMdDownload } from 'npm:solid-icons/io';