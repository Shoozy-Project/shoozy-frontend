'use client';

import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
  ShoppingBag,
  Activity,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { UserDto } from '@/types/user';

interface ViewUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDto | null;
}

const formatUserId = (id: string) => {
  const shortHex = id.replace(/-/g, '').slice(0, 3).toUpperCase();
  return `USR-${shortHex}`;
};

const ViewUserModal = ({ open, onOpenChange, user }: ViewUserModalProps) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#FF8C00]/10 via-amber-50 to-orange-50 px-6 py-6 border-b border-gray-100">
          <DialogHeader className="p-0 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-[#FF8C00] bg-white/80 px-2 py-0.5 rounded border border-[#FF8C00]/20">
                {formatUserId(user.id)}
              </span>
              <Badge
                className={
                  user.role === 'ADMIN'
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 text-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200 text-xs'
                }
              >
                {user.role}
              </Badge>
            </div>
            <DialogTitle className="text-xl font-bold text-black mt-2">
              {user.fullName || `${user.firstName} ${user.lastName}`}
            </DialogTitle>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {user.email}
            </p>
          </DialogHeader>
        </div>

        {/* Profile Info Details */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Governorate */}
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 space-y-1">
              <span className="text-gray-400 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#FF8C00]" />
                Governorate / Region
              </span>
              <p className="font-semibold text-black">{user.governorate || 'Tunis'}</p>
            </div>

            {/* Account Status */}
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 space-y-1">
              <span className="text-gray-400 flex items-center gap-1 font-medium">
                <Activity className="w-3.5 h-3.5 text-[#FF8C00]" />
                Account Status
              </span>
              <div>
                {user.status === 'ACTIVE' ? (
                  <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200 text-xs">
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200 text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 space-y-1">
              <span className="text-gray-400 flex items-center gap-1 font-medium">
                <Phone className="w-3.5 h-3.5 text-[#FF8C00]" />
                Phone Number
              </span>
              <p className="font-semibold text-black">{user.phone || 'Not provided'}</p>
            </div>

            {/* Total Orders */}
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 space-y-1">
              <span className="text-gray-400 flex items-center gap-1 font-medium">
                <ShoppingBag className="w-3.5 h-3.5 text-[#FF8C00]" />
                Total Orders
              </span>
              <p className="font-semibold text-black">{user._count?.orders ?? 0} orders</p>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/70 border border-gray-100 text-xs">
            <span className="text-gray-500 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Member Since
            </span>
            <span className="font-medium text-black">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Close Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserModal;
