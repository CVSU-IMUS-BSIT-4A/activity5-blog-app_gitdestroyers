import { useEffect, useMemo, useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog'
import { useTheme } from '../hooks/useTheme'
import { Palette, Bell, User, Home, MessagesSquare, Globe, Accessibility, Check, Video, Link, Shield, ChevronRight, Settings, Menu, IdCard, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { ScrollArea } from './ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from './ui/sidebar'
import { updateUser } from '../api'
import { useCurrentUser } from '../hooks/useCurrentUser'
import { toast } from 'sonner'

type SettingsDialogProps = {
  triggerLabel?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  hideTrigger?: boolean
}

export default function SettingsDialog({ triggerLabel = 'Settings', open: openProp, onOpenChange, hideTrigger }: SettingsDialogProps) {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { currentUser } = useCurrentUser()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const isControlled = typeof openProp === 'boolean'
  const open = isControlled ? (openProp as boolean) : uncontrolledOpen
  const setOpen = isControlled && onOpenChange ? onOpenChange : setUncontrolledOpen
  const [activeSection, setActiveSection] = useState<
    | 'appearance'
    | 'account'
    | 'profile'
  >('appearance')

  const items: { id: typeof activeSection; label: string; icon: React.ReactNode }[] = [
    { id: 'appearance', label: 'Appearance', icon: <Palette className="h-4 w-4" /> },
    { id: 'account', label: 'Account', icon: <User className="h-4 w-4" /> },
    { id: 'profile', label: 'Profile', icon: <IdCard className="h-4 w-4" /> },
  ]

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [focusedField, setFocusedField] = useState<null | 'password' | 'confirm'>(null)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Initialize profile fields from current user
  useEffect(() => {
    if (!currentUser?.name) return
    const parts = currentUser.name.trim().split(/\s+/)
    const f = parts[0] ?? ''
    const l = parts.length > 1 ? parts[parts.length - 1] : ''
    const m = parts.length > 2 ? parts.slice(1, -1).join(' ') : ''
    setFirstName(f)
    setMiddleName(m)
    setLastName(l)
  }, [currentUser?.name])

  const canSaveProfile = useMemo(() => {
    return firstName.trim().length > 0 && lastName.trim().length > 0
  }, [firstName, lastName])

  const handleSaveProfile = async () => {
    if (!currentUser?.id) return
    if (!canSaveProfile) return
    const composedName = [firstName.trim(), middleName.trim(), lastName.trim()].filter(Boolean).join(' ')
    try {
      setIsSavingProfile(true)
      await updateUser(currentUser.id, { name: composedName })
      toast.success('Profile updated')
      setIsEditingProfile(false)
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update profile'
      toast.error('Failed to update profile', { description: String(message) })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const passwordRequirements = {
    length: newPassword.length >= 8,
    number: /\d/.test(newPassword),
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  }
  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)
  const isConfirmValid = confirmPassword.length > 0 && confirmPassword === newPassword
  const canSavePassword = currentPassword.length > 0 && isPasswordValid && isConfirmValid

  const handleSavePassword = async () => {
    if (!currentUser?.id) return
    if (!canSavePassword) return
    try {
      setIsSavingPassword(true)
      await updateUser(currentUser.id, { password: newPassword, currentPassword })
      toast.success('Password updated')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update password'
      toast.error('Failed to update password', { description: String(message) })
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline">{triggerLabel}</Button>
        </DialogTrigger>
      )}
      <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Customize your settings here.</DialogDescription>
        </DialogHeader>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex bg-muted/40">
            <SidebarContent className="p-3">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {items.map((item) => (
                      <SidebarMenuItem key={String(item.label)}>
                        <SidebarMenuButton
                          asChild
                          isActive={activeSection === item.id}
                          className="hover:bg-primary/10 data-[active=true]:bg-primary/15"
                          onClick={() => setActiveSection(item.id)}
                        >
                          <a href="#">
                            {item.icon}
                            <span>{item.label}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex h-[480px] flex-1 flex-col overflow-hidden bg-background/70">
            <header className="flex h-16 shrink-0 items-center gap-2 bg-background/70">
              <div className="flex items-center gap-2 px-4 text-sm text-muted-foreground">
                <span className="hidden md:inline">Settings</span>
                <ChevronRight className="hidden md:inline h-4 w-4" />
                <span className="text-foreground font-medium">{items.find(i => i.id === activeSection)?.label}</span>
              </div>
            </header>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-4 p-4 pt-0">
              {activeSection === 'appearance' && (
                <div className="flex items-center justify-between max-w-3xl bg-card/60 rounded-lg p-4">
                  <div className="flex flex-col">
                    <span className="font-medium">Theme</span>
                    <span className="text-muted-foreground text-sm">Switch between light and dark mode</span>
                  </div>
                  <Button variant="secondary" onClick={toggleDarkMode}>
                    {isDarkMode ? 'Use light mode' : 'Use dark mode'}
                  </Button>
                </div>
              )}

              {activeSection !== 'appearance' && (
                <>
                  {activeSection === 'account' ? (
                    <div className="max-w-3xl bg-card/60 rounded-lg p-4 space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-base font-semibold">Change password</h3>
                        <p className="text-sm text-muted-foreground">Update your password. Make sure it’s strong and unique.</p>
                      </div>

                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="current-password">Current password</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showCurrent ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              onClick={() => setShowCurrent((v) => !v)}
                              aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                            >
                              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="new-password">New password</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showNew ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              onFocus={() => setFocusedField('password')}
                              onBlur={() => setFocusedField((prev) => (prev === 'password' ? null : prev))}
                              placeholder="Enter new password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              onClick={() => setShowNew((v) => !v)}
                              aria-label={showNew ? 'Hide new password' : 'Show new password'}
                            >
                              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>

                          {(focusedField === 'password' || newPassword.length > 0) && (
                            <ul className="text-xs grid gap-1 pl-1">
                              <li className={`flex items-center gap-2 ${passwordRequirements.length ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                {passwordRequirements.length ? (
                                  <CheckCircle className="h-3.5 w-3.5" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                                )}
                                <span>Minimum of 8 characters</span>
                              </li>
                              <li className={`flex items-center gap-2 ${passwordRequirements.number ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                {passwordRequirements.number ? (
                                  <CheckCircle className="h-3.5 w-3.5" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                                )}
                                <span>At least one numeric character</span>
                              </li>
                              <li className={`flex items-center gap-2 ${passwordRequirements.upper ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                {passwordRequirements.upper ? (
                                  <CheckCircle className="h-3.5 w-3.5" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                                )}
                                <span>At least one uppercase character</span>
                              </li>
                              <li className={`flex items-center gap-2 ${passwordRequirements.lower ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                {passwordRequirements.lower ? (
                                  <CheckCircle className="h-3.5 w-3.5" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                                )}
                                <span>At least one lowercase character</span>
                              </li>
                              <li className={`flex items-center gap-2 ${passwordRequirements.special ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                {passwordRequirements.special ? (
                                  <CheckCircle className="h-3.5 w-3.5" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                                )}
                                <span>At least one special character</span>
                              </li>
                            </ul>
                          )}
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="confirm-password">Confirm new password</Label>
                          <div className="relative">
                            <Input
                              id="confirm-password"
                              type={showConfirm ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              onFocus={() => setFocusedField('confirm')}
                              onBlur={() => setFocusedField((prev) => (prev === 'confirm' ? null : prev))}
                              placeholder="Re-enter new password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="absolute right-2 top-1/2 -translate-y-1/2"
                              onClick={() => setShowConfirm((v) => !v)}
                              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                            >
                              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          {(focusedField === 'confirm' || confirmPassword.length > 0) && (
                            <div className={`text-xs flex items-center gap-2 ${isConfirmValid ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                              {isConfirmValid ? (
                                <CheckCircle className="h-3.5 w-3.5" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 text-destructive" />
                              )}
                              <span>Must be same as password</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }} disabled={isSavingPassword}>Clear</Button>
                        <Button disabled={!canSavePassword || isSavingPassword} onClick={handleSavePassword}>
                          {isSavingPassword ? 'Saving...' : 'Save password'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-3xl bg-card/60 rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-base font-semibold">Profile</h3>
                          <p className="text-sm text-muted-foreground">View and edit your basic profile information.</p>
                        </div>
                        {!isEditingProfile ? (
                          <Button variant="secondary" onClick={() => setIsEditingProfile(true)}>Edit</Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" disabled={isSavingProfile} onClick={() => { setIsEditingProfile(false); /* revert to user data */ if (currentUser?.name) { const parts = currentUser.name.trim().split(/\s+/); const f = parts[0] ?? ''; const l = parts.length > 1 ? parts[parts.length - 1] : ''; const m = parts.length > 2 ? parts.slice(1, -1).join(' ') : ''; setFirstName(f); setMiddleName(m); setLastName(l); } }}>Cancel</Button>
                            <Button disabled={!canSaveProfile || isSavingProfile} onClick={handleSaveProfile}>{isSavingProfile ? 'Saving...' : 'Save'}</Button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="first-name">First name</Label>
                          <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!isEditingProfile} placeholder="Enter first name" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="middle-name">Middle name (optional)</Label>
                          <Input id="middle-name" value={middleName} onChange={(e) => setMiddleName(e.target.value)} disabled={!isEditingProfile} placeholder="Enter middle name" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="last-name">Last name</Label>
                          <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!isEditingProfile} placeholder="Enter last name" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              </div>
            </ScrollArea>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}


