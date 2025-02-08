/**
 * Header Component with Theme Switcher and Notifications
 * Created: 2025-02-08 11:10:12 UTC
 * Author: @toowiredd
 */

import { createSignal, Show } from 'npm:solid-js';
import { styled } from 'npm:solid-styled-components';
import { IoMdNotifications, IoMdMoon, IoMdSunny } from 'npm:solid-icons/io';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: var(--surface-1);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-1);
  transition: background 0.2s;

  &:hover {
    background: var(--surface-2);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export function Header() {
  const [isDark, setIsDark] = createSignal(false);
  const [notifications, setNotifications] = createSignal([]);
  
  const toggleTheme = () => {
    setIsDark(!isDark());
    document.documentElement.classList.toggle('dark-theme');
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Subscribe to push notifications
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
        });
        // Send subscription to server
        await fetch('https://api.val.town/v1/@toowired/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      }
    }
  };

  return (
    <HeaderContainer>
      <h1>Prompt Library</h1>
      <Actions>
        <IconButton onClick={requestNotificationPermission}>
          <IoMdNotifications size={24} />
          <Show when={notifications().length > 0}>
            <NotificationBadge>{notifications().length}</NotificationBadge>
          </Show>
        </IconButton>
        <IconButton onClick={toggleTheme}>
          <Show 
            when={isDark()}
            fallback={<IoMdSunny size={24} />}
          >
            <IoMdMoon size={24} />
          </Show>
        </IconButton>
      </Actions>
    </HeaderContainer>
  );
}