/**
 * Floating Action Button Component
 * Created: 2025-02-08 11:11:14 UTC
 * Author: @toowired
 */

import { createSignal, Show } from 'npm:solid-js';
import { styled } from 'npm:solid-styled-components';
import { Motion } from 'npm:@motionone/solid';
import { IoMdAdd, IoMdShare, IoMdDownload } from 'npm:solid-icons/io';

const FloatingButton = styled(Motion.button)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  &:hover {
    transform: scale(1.1);
  }
`;

const ActionMenu = styled(Motion.div)`
  position: fixed;
  bottom: 5rem;
  right: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 999;
`;

const ActionItem = styled(Motion.button)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--surface-1);
  color: var(--text-1);
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--surface-2);
  }
`;

export function ActionButton() {
  const [isOpen, setIsOpen] = createSignal(false);
  const [deferredPrompt, setDeferredPrompt] = createSignal(null);

  // Listen for PWA install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    setDeferredPrompt(e);
  });

  const handleInstall = async () => {
    const prompt = deferredPrompt();
    if (prompt) {
      prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Prompt Library',
          text: 'Check out this awesome AI Prompt Library!',
          url: window.location.href
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  return (
    <>
      <Show when={isOpen()}>
        <ActionMenu
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <ActionItem onClick={handleShare}>
            <IoMdShare size={24} />
          </ActionItem>
          <Show when={deferredPrompt()}>
            <ActionItem onClick={handleInstall}>
              <IoMdDownload size={24} />
            </ActionItem>
          </Show>
        </ActionMenu>
      </Show>
      <FloatingButton 
        onClick={() => setIsOpen(!isOpen())}
        animate={{
          rotate: isOpen() ? '45deg' : '0deg'
        }}
      >
        <IoMdAdd size={24} />
      </FloatingButton>
    </>
  );
}