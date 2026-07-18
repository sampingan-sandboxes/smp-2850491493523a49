import type { ReactElement } from 'react';
import type { PlaybookTrigger } from '@/interfaces/playbook-config';

interface TriggerComboboxProps {
  idToken: string;
  selected: PlaybookTrigger | null;
  onSelect: (trigger: PlaybookTrigger) => void;
  disabled?: boolean;
}

/**
 * YOUR TASK — implement the trigger search + selection combobox.
 *
 * Behaviour:
 * - When nothing is selected (or the search is reopened), render a search combobox. Use the
 *   provided `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandItem` from
 *   `@/base/components/ui/command` (set `shouldFilter={false}` — the backend does the
 *   filtering). The input has role "combobox".
 * - The combobox only searches once it has been opened (focus opens it). While open,
 *   debounce the query (~250ms) and call `searchTriggers(idToken, query)` from `../triggers`,
 *   rendering each result as a `CommandItem` (role "option") showing its name and toolkit.
 *   Cancel in-flight/stale searches so a late response can't clobber a newer query. Show
 *   `CommandEmpty` ("No connected triggers found") when there are no matches.
 * - Close the list when the user clicks outside the component.
 * - Choosing an option calls `onSelect(trigger)` and collapses back to the summary.
 * - When a trigger IS selected and the search is closed, render a summary card (with a
 *   `data-testid="selected-trigger"`) showing the trigger name and its
 *   `toolkitName ?? toolkit`, plus a "Change" button that reopens the search.
 * - While `disabled`, the input is disabled and the summary shows a spinner
 *   (`Loader2Icon` from `lucide-react`, `aria-label="Saving"`) instead of the "Change"
 *   button.
 *
 * The component always renders an element, so its return type is `ReactElement`.
 */
function TriggerCombobox(_props: TriggerComboboxProps): ReactElement {
  throw new Error('NotImplemented');
}

export default TriggerCombobox;
