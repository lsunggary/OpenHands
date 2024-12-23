import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import InstructionsRoute from '../../src/routes/_oh.app.instructions/route';

// Mock the InstructionsPanel component
jest.mock('../../src/components/features/instructions/instructions-panel', () => ({
  InstructionsPanel: ({ repoName, hasInstructions, tutorialUrl, onAddInstructions }) => (
    <div data-testid="instructions-panel">
      <p>Repo: {repoName}</p>
      <p>Has Instructions: {hasInstructions.toString()}</p>
      <p>Tutorial URL: {tutorialUrl}</p>
      <button onClick={onAddInstructions}>Add Instructions</button>
    </div>
  ),
}));

describe('InstructionsRoute', () => {
  it('renders InstructionsPanel with correct props', () => {
    const initialState = {
      initalQuery: {
        selectedRepository: 'test-org/test-repo',
      },
    };

    renderWithProviders(<InstructionsRoute />, {
      preloadedState: initialState,
    });

    expect(screen.getByTestId('instructions-panel')).toBeInTheDocument();
    expect(screen.getByText('Repo: test-org/test-repo')).toBeInTheDocument();
    expect(screen.getByText('Has Instructions: false')).toBeInTheDocument();
    expect(screen.getByText('Tutorial URL:')).toBeInTheDocument();
  });

  // Add more tests as needed
});