import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import QuizDemo from './QuizDemo';

it('validates incomplete answers, scores mixed answers, explains them, and restarts', async () => {
  const user = userEvent.setup(); render(<QuizDemo/>);
  await user.click(screen.getByRole('button',{name:/Check my answers/}));
  expect(screen.getByRole('alert')).toHaveTextContent('Answer all three');
  await user.click(screen.getByLabelText('The useState hook'));
  await user.click(screen.getByLabelText('Encrypt passwords automatically'));
  await user.click(screen.getByLabelText('A stable, unique project ID'));
  expect(screen.getByRole('progressbar')).toHaveAttribute('value','3');
  await user.click(screen.getByRole('button',{name:/Check my answers/}));
  expect(screen.getByRole('heading',{name:'Your score: 2 / 3'})).toHaveFocus();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByText(/It does not provide encryption/)).toBeVisible();
  await user.click(screen.getByRole('button',{name:/Try again/}));
  expect(screen.getByRole('progressbar')).toHaveAttribute('value','0');
  for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked();
});
