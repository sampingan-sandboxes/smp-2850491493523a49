Feature: Playbook run data access
  The API clients behind the run-history experience — searching connected triggers, listing
  a playbook's runs, and fetching a single run (all Bearer-authenticated) — plus the shared
  run-status to display-metadata mapping.

  Scenario: Searching triggers returns the matching catalog entries
    Given the triggers endpoint will return a "New Gmail Message" trigger for search "gmail"
    When triggers are searched for "gmail"
    Then the returned triggers include "New Gmail Message"

  Scenario: Searching triggers sends the token as a Bearer credential and an explicit search param
    When triggers are searched for "slack" with token "the-token"
    Then the triggers request carried authorization "Bearer the-token"
    And the triggers request search param was "slack"

  Scenario: Searching triggers throws when the backend fails
    Given the triggers endpoint will fail with status 502
    When searching triggers is attempted for "gmail"
    Then searching triggers is rejected with "Failed to search triggers: 502"

  Scenario: Listing runs returns the playbook's runs
    Given the runs endpoint for playbook "playbook-1" will return one run
    When runs are listed for playbook "playbook-1"
    Then one run is returned

  Scenario: Listing runs sends a GET with the Bearer token
    When runs are listed for playbook "playbook-1" with token "the-token"
    Then the runs request carried authorization "Bearer the-token"
    And the runs request method was "GET"

  Scenario: Listing runs throws when the backend fails
    Given the runs endpoint for playbook "playbook-1" will fail with status 502
    When listing runs is attempted for playbook "playbook-1"
    Then listing runs is rejected with "Failed to load playbook runs: 502"

  Scenario: Fetching a single run returns it
    Given the run endpoint for playbook "playbook-1" run "run-42" will return that run
    When run "run-42" of playbook "playbook-1" is fetched
    Then the fetched run has id "run-42"

  Scenario: Fetching a single run throws when it is missing
    Given the run endpoint for playbook "playbook-1" run "run-42" will fail with status 404
    When fetching run "run-42" of playbook "playbook-1" is attempted
    Then fetching the run is rejected with "Failed to load playbook run: 404"

  Scenario Outline: Run status maps to display metadata
    When the display metadata for status "<status>" is read
    Then its label is "<label>"
    And its text class is "<textClass>"
    And its dot class is "<dotClass>"

    Examples:
      | status    | label     | textClass             | dotClass            |
      | running   | Running   | text-primary          | bg-primary          |
      | completed | Completed | text-foreground       | bg-foreground       |
      | gated_out | Gated out | text-muted-foreground | bg-muted-foreground |
      | failed    | Failed    | text-destructive      | bg-destructive      |
