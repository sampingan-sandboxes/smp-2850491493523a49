import { useNavigate } from 'react-router-dom';
import { signOut } from '@/components/auth/auth';
import { initials, type IdTokenClaims } from '@/components/auth/idToken';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

function Header({ claims }: { claims: IdTokenClaims }) {
  const navigate = useNavigate();

  return (
    <header className="border-border bg-background flex h-16 w-full items-center justify-between border-b px-6 shadow-[0_1px_0_rgba(124,58,237,0.04)]">
      <button
        onClick={() => navigate('/')}
        aria-label="Go to home"
        className="flex cursor-pointer items-center gap-2.5 border-none bg-transparent p-0"
      >
        <img src="/favicon.svg" alt="" className="size-[26px]" />
        <span className="text-primary text-base font-bold tracking-tight">Playbook</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Account menu"
            className="border-border bg-secondary text-primary focus-visible:ring-ring/50 flex size-[34px] cursor-pointer items-center justify-center overflow-hidden rounded-full border text-xs font-bold transition-colors outline-none focus-visible:ring-[3px]"
          >
            {claims.picture ? (
              <img src={claims.picture} alt="" className="size-full object-cover" />
            ) : (
              initials(claims)
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuItem onSelect={() => navigate('/settings')}>Settings</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => signOut()}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export default Header;
