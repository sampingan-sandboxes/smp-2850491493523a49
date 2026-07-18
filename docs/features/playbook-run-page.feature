Feature: Playbook run detail page
  Rendering a single run: its status, metadata, gate reasoning, tool calls, response, and
  the failed and running edge cases — plus redirecting when there is no signed-in user.

  Scenario: It redirects to login when there is no signed-in user
    When the run page is opened for playbook "t1" run "r1" with no signed-in user
    Then the login screen is shown

  Scenario: A completed run renders its status, gate reasoning, and response
    Given a completed run "r1" of playbook "t1"
    When the run page is opened for playbook "t1" run "r1"
    Then the status "Completed" is shown
    And the gate reasoning is shown
    And the response is shown
    And no error section is shown

  Scenario: A completed run expands a tool call to reveal its output
    Given a completed run "r1" of playbook "t1"
    When the run page is opened for playbook "t1" run "r1"
    And the run has loaded
    Then the tool call output is hidden until expanded
    And expanding the tool call reveals its output

  Scenario: A failed run shows its error and its gate reasoning
    Given a failed run "r1" of playbook "t1"
    When the run page is opened for playbook "t1" run "r1"
    Then the status "Failed" is shown
    And the error message is shown
    And the gate reasoning is shown

  Scenario: A running run shows the evaluating gate fallback
    Given a running run "r1" of playbook "t1"
    When the run page is opened for playbook "t1" run "r1"
    Then the status "Running" is shown
    And the gate reasoning fallback "Evaluating…" is shown

  Scenario: It shows an error state when the run cannot be loaded
    Given the run "r1" of playbook "t1" cannot be loaded
    When the run page is opened for playbook "t1" run "r1"
    Then the load error "Failed to load run" is shown
