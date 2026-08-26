'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import {
  User,
  Shield,
  Loader2,
  AlertTriangle,
  Lock,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  editUserSchema,
  type EditUserFormInput,
} from '@/validations/user';
import { adminUsersApi } from '@/lib/api/users';
import type { UserDto } from '@/types/user';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDto | null;
}

const EditUserModal = ({ open, onOpenChange, user }: EditUserModalProps) => {
  const queryClient = useQueryClient();
  const [roleChangeConfirmed, setRoleChangeConfirmed] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<EditUserFormInput>({
    resolver: zodResolver(editUserSchema) as import('react-hook-form').Resolver<EditUserFormInput>,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      governorate: 'Tunis',
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (open && user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? '',
        governorate: user.governorate || 'Tunis',
        role: user.role,
        status: user.status,
      });
      setRoleChangeConfirmed(false);
    }
  }, [open, user, reset]);

  const selectedRole = watch('role');
  const isRoleChanging = !!(user && selectedRole !== user.role);

  const updateMutation = useMutation({
    mutationFn: (data: EditUserFormInput) =>
      adminUsersApi.update(user!.id, {
        firstName: user!.firstName,
        lastName: user!.lastName,
        email: user!.email,
        phone: user!.phone,
        governorate: user!.governorate,
        role: data.role,
        status: data.status,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User "${res.data.data.fullName}" updated successfully!`);
      onOpenChange(false);
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        toast.error(err.response?.data?.error?.message ?? 'Failed to update user.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    },
  });

  const onSubmit = (data: EditUserFormInput) => {
    if (isRoleChanging && !roleChangeConfirmed) {
      toast.error('Please confirm the role privilege change before saving.');
      return;
    }
    updateMutation.mutate(data);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FFF3E0] flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#FF8C00]" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-black">
                Edit User Role & Status
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Manage access roles and account status for {user.email}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} id="edit-user-form">
          <div className="px-6 py-5 space-y-4">
            {/* Privacy Security Read-only Notice */}
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <span>
                Identity fields (name, email, phone, governorate) are read-only for privacy compliance.
              </span>
            </div>

            {/* Name Grid (Disabled / Read-only) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  First Name
                </Label>
                <Input
                  value={user.firstName}
                  disabled
                  readOnly
                  className="bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Last Name
                </Label>
                <Input
                  value={user.lastName}
                  disabled
                  readOnly
                  className="bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200"
                />
              </div>
            </div>

            {/* Email & Phone Grid (Disabled / Read-only) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Email Address
                </Label>
                <Input
                  value={user.email}
                  disabled
                  readOnly
                  className="bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Phone Number
                </Label>
                <Input
                  value={user.phone ?? 'Not provided'}
                  disabled
                  readOnly
                  className="bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200"
                />
              </div>
            </div>

            {/* Governorate (Read-only) & Status (Editable) Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Governorate / Region
                </Label>
                <Input
                  value={user.governorate || 'Tunis'}
                  disabled
                  readOnly
                  className="bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200"
                />
              </div>

              {/* Editable Status */}
              <div className="space-y-1.5">
                <Label htmlFor="usr-status" className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Account Status <span className="text-red-500">*</span>
                </Label>
                <select
                  id="usr-status"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-0 cursor-pointer"
                  {...register('status')}
                >
                  <option value="ACTIVE">ACTIVE (Normal Access)</option>
                  <option value="INACTIVE">INACTIVE (Deactivated)</option>
                  <option value="SUSPENDED">SUSPENDED (Banned)</option>
                </select>
                {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
              </div>
            </div>

            {/* Editable Role Dropdown */}
            <div className="space-y-1.5 pt-2 border-t border-gray-100">
              <Label htmlFor="usr-role" className="text-xs font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#FF8C00]" />
                User Access Role <span className="text-red-500">*</span>
              </Label>
              <select
                id="usr-role"
                className="w-full px-3 py-2 border border-input rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:ring-offset-0 cursor-pointer font-medium"
                {...register('role')}
              >
                <option value="CUSTOMER">CUSTOMER (Standard Public Customer)</option>
                <option value="ADMIN">ADMIN (Store Manager — Catalog & Orders)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full Owner — Users & Settings)</option>
              </select>
              {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
            </div>

            {/* Role Privilege Warning Safeguard */}
            {isRoleChanging && (
              <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Role Privilege Escalation Safeguard</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  You are changing this user's role from{' '}
                  <span className="font-bold">{user.role}</span> to{' '}
                  <span className="font-bold">{selectedRole}</span>. This will immediately update permissions in PostgreSQL.
                </p>
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    id="confirm-role-change-checkbox"
                    type="checkbox"
                    checked={roleChangeConfirmed}
                    onChange={(e) => setRoleChangeConfirmed(e.target.checked)}
                    className="rounded border-amber-300 text-[#FF8C00] focus:ring-[#FF8C00]"
                  />
                  <span className="text-xs font-medium text-amber-950">
                    I confirm updating role access for this user
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3 sticky bottom-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="edit-user-form"
              disabled={updateMutation.isPending || (isRoleChanging && !roleChangeConfirmed)}
              className="flex-1 sm:flex-none bg-[#FF8C00] hover:bg-[#e67e00] text-white flex items-center gap-2"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
