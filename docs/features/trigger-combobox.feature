Feature: Trigger combobox
  Searching, selecting, and changing a playbook's trigger through the combobox component.

  Scenario: It shows a search input when nothing is selected
    When the combobox is rendered with no selection
    Then a search combobox is shown

  Scenario: It shows matching triggers as the user types
    Given the backend has a "New Gmail Message" trigger for search "gmail"
    When the combobox is rendered with no selection
    And the user types "gmail" into the search box
    Then the option "New Gmail Message" is shown

  Scenario: It reports the chosen trigger to the caller
    Given the backend returns a "New Gmail Message" trigger for any search
    When the combobox is rendered with no selection
    And the user opens the combobox
    And the user picks the "New Gmail Message" option
    Then the caller was notified of the selected trigger

  Scenario: It shows the selected trigger summary instead of the search box
    When the combobox is rendered with the Gmail trigger already selected
    Then the selected trigger summary shows "New Gmail Message"
    And no search combobox is shown

  Scenario: It reopens the search box when Change is clicked
    Given the backend returns no triggers for any search
    When the combobox is rendered with the Gmail trigger already selected
    And the user clicks "Change"
    Then a search combobox is shown

  Scenario: It shows a saving indicator instead of Change while disabled
    When the combobox is rendered with the Gmail trigger selected and disabled
    Then a "Saving" indicator is shown
    And no "Change" button is shown
