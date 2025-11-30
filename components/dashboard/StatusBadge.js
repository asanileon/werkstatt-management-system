import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function StatusBadge({ type, status }) {
  const badges = {
    tuv: {
      overdue: {
        icon: AlertCircle,
        text: 'tüv fällig!',
        className: 'bg-red-100 text-red-800 border-red-300',
      },
      warning: {
        icon: Clock,
        text: 'tüv bald fällig',
        className: 'bg-orange-100 text-orange-800 border-orange-300',
      },
      ok: {
        icon: CheckCircle,
        text: 'tüv ok',
        className: 'bg-green-100 text-green-800 border-green-300',
      },
    },
    service: {
      due: {
        icon: AlertCircle,
        text: 'service fällig',
        className: 'bg-red-100 text-red-800 border-red-300',
      },
      ok: {
        icon: CheckCircle,
        text: 'service ok',
        className: 'bg-green-100 text-green-800 border-green-300',
      },
    },
  };

  const badgeConfig = badges[type]?.[status];

  if (!badgeConfig) return null;

  const Icon = badgeConfig.icon;

  return (
    <span
      className={`font-medium inline-flex border items-center text-xs rounded-full py-1 px-2.5 ${badgeConfig.className}`}
    >
      <Icon className="w-3 h-3 mr-1" />
      {badgeConfig.text}
    </span>
  );
}

export function getTuvStatus(nextTuvDate) {
  if (!nextTuvDate) return 'ok';

  const today = new Date();
  const tuvDate = new Date(nextTuvDate);
  const warningDate = new Date(tuvDate);
  warningDate.setMonth(warningDate.getMonth() - 1); // 1 monat vorher warnen
  warningDate.setMonth(warningDate.getMonth() - 1);

  if (today >= tuvDate) return 'overdue';
  if (today >= warningDate) return 'warning';
  return 'ok';
}

export function getServiceStatus(currentKm, lastServiceKm) {
  const SERVICE_INTERVAL = 15000;
  
  if (!lastServiceKm) return 'due';
  
  const kmSinceService = currentKm - lastServiceKm;
  return kmSinceService >= SERVICE_INTERVAL ? 'due' : 'ok';
}
