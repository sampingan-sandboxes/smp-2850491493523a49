// Provided acceptance suite — do not modify.
// Executes docs/features/trigger-combobox.feature against your component.
import { defineFeature, loadFeature } from 'jest-cucumber';
import { http, HttpResponse } from 'msw';
import { beforeEach, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { backendUrl } from '@/base/config';
import { server } from '@/base/test/server';
import type { PlaybookTrigger } from '@/interfaces/playbook-config';
import TriggerCombobox from '../src/components/playbook/components/TriggerCombobox';

const feature = loadFeature('docs/features/trigger-combobox.feature');

const gmailTrigger: PlaybookTrigger = {
  slug: 'GMAIL_NEW_GMAIL_MESSAGE',
  toolkit: 'gmail',
  name: 'New Gmail Message',
  toolkitName: 'Gmail',
};

const onSelect = vi.fn<(trigger: PlaybookTrigger) => void>();
let user: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  onSelect.mockReset();
  user = userEvent.setup();
});

function renderUnselected() {
  render(<TriggerCombobox idToken="the-id-token" selected={null} onSelect={onSelect} />);
}

function renderSelected(disabled = false) {
  render(<TriggerCombobox idToken="the-id-token" selected={gmailTrigger} onSelect={onSelect} disabled={disabled} />);
}

defineFeature(feature, (test) => {
  test('It shows a search input when nothing is selected', ({ when, then }) => {
    when('the combobox is rendered with no selection', () => {
      renderUnselected();
    });
    then('a search combobox is shown', () => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  test('It shows matching triggers as the user types', ({ given, when, and, then }) => {
    given(/^the backend has a "([^"]*)" trigger for search "([^"]*)"$/, (name, search) => {
      server.use(
        http.get(`${backendUrl}/triggers`, ({ request }) => {
          const s = new URL(request.url).searchParams.get('search');
          if (s === search) return HttpResponse.json({ triggers: [{ ...gmailTrigger, name }] });
          return HttpResponse.json({ triggers: [] });
        }),
      );
    });
    when('the combobox is rendered with no selection', () => {
      renderUnselected();
    });
    and(/^the user types "([^"]*)" into the search box$/, async (text) => {
      await user.type(screen.getByRole('combobox'), text);
    });
    then(/^the option "([^"]*)" is shown$/, async (name) => {
      expect(await screen.findByRole('option', { name: new RegExp(name) })).toBeInTheDocument();
    });
  });

  test('It reports the chosen trigger to the caller', ({ given, when, and, then }) => {
    given(/^the backend returns a "([^"]*)" trigger for any search$/, () => {
      server.use(http.get(`${backendUrl}/triggers`, () => HttpResponse.json({ triggers: [gmailTrigger] })));
    });
    when('the combobox is rendered with no selection', () => {
      renderUnselected();
    });
    and('the user opens the combobox', async () => {
      await user.click(screen.getByRole('combobox'));
    });
    and(/^the user picks the "([^"]*)" option$/, async (name) => {
      const option = await screen.findByRole('option', { name: new RegExp(name) });
      await user.click(option);
    });
    then('the caller was notified of the selected trigger', () => {
      expect(onSelect).toHaveBeenCalledWith(gmailTrigger);
    });
  });

  test('It shows the selected trigger summary instead of the search box', ({ when, then, and }) => {
    when('the combobox is rendered with the Gmail trigger already selected', () => {
      renderSelected();
    });
    then(/^the selected trigger summary shows "([^"]*)"$/, (name) => {
      expect(screen.getByTestId('selected-trigger')).toBeInTheDocument();
      expect(screen.getByText(name)).toBeInTheDocument();
    });
    and('no search combobox is shown', () => {
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
  });

  test('It reopens the search box when Change is clicked', ({ given, when, and, then }) => {
    given(/^the backend returns no triggers for any search$/, () => {
      server.use(http.get(`${backendUrl}/triggers`, () => HttpResponse.json({ triggers: [] })));
    });
    when('the combobox is rendered with the Gmail trigger already selected', () => {
      renderSelected();
    });
    and(/^the user clicks "([^"]*)"$/, async (label) => {
      await user.click(screen.getByRole('button', { name: label }));
    });
    then('a search combobox is shown', () => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  test('It shows a saving indicator instead of Change while disabled', ({ when, then, and }) => {
    when('the combobox is rendered with the Gmail trigger selected and disabled', () => {
      renderSelected(true);
    });
    then(/^a "([^"]*)" indicator is shown$/, (label) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
    and(/^no "([^"]*)" button is shown$/, (label) => {
      expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
    });
  });
});
