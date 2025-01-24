import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, test, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { formatTimeDelta } from "#/utils/format-time-delta";
import { ConversationCard } from "#/components/features/conversation-panel/conversation-card";
import { clickOnEditButton } from "./utils";

describe("ConversationCard", () => {
  const onDelete = vi.fn();
  const onChangeTitle = vi.fn();
  const onDownloadWorkspace = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the conversation card", () => {
    render(
      <ConversationCard
        conversationID="deadbeef"
        onDelete={onDelete}
        onChangeTitle={onChangeTitle}
        isActive
        title="Conversation 1"
        selectedRepository={null}
        lastUpdatedAt="2021-10-01T12:00:00Z"
      />,
    );
    const expectedDate = `${formatTimeDelta(new Date("2021-10-01T12:00:00Z"))} ago`;

    const card = screen.getByTestId("conversation-card");
    const title = within(card).getByTestId("conversation-card-title");
    expect(title).toHaveTextContent("Conversation 1");
    within(card).getByText(expectedDate);
  });

  it("should render the selectedRepository if available", () => {
    const { rerender } = render(
      <ConversationCard
        conversationID="deadbeef"
        onDelete={onDelete}
        onChangeTitle={onChangeTitle}
        isActive
        title="Conversation 1"
        selectedRepository={null}
        lastUpdatedAt="2021-10-01T12:00:00Z"
      />,
    );

    expect(
      screen.queryByTestId("conversation-card-selected-repository"),
    ).not.toBeInTheDocument();

    rerender(
      <ConversationCard
        conversationID="deadbeef"
        onDelete={onDelete}
        onChangeTitle={onChangeTitle}
        isActive
        title="Conversation 1"
        selectedRepository="org/selectedRepository"
        lastUpdatedAt="2021-10-01T12:00:00Z"
      />,
    );

    screen.getByTestId("conversation-card-selected-repository");
  });

  it("should toggle a context menu when clicking the ellipsis button", async () => {
    const user = userEvent.setup();
    render(
      <ConversationCard
        conversationID="deadbeef"
        onDelete={onDelete}
        onChangeTitle={onChangeTitle}
        isActive
        title="Conversation 1"
        selectedRepository={null}
        lastUpdatedAt="2021-10-01T12:00:00Z"
      />,
    );

    expect(screen.queryByTestId("context-menu")).not.toBeInTheDocument();

    const ellipsisButton = screen.getByTestId("ellipsis-button");
    await user.click(ellipsisButton);

    screen.getByTestId("context-menu");

    await user.click(ellipsisButton);

    expect(screen.queryByTestId("context-menu")).not.toBeInTheDocument();
  });

  it("should call onDelete when the delete button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ConversationCard
        conversationID="deadbeef"
        onDelete={onDelete}
        isActive
        onChangeTitle={onChangeTitle}
        title="Conversation 1"
        selectedRepository={null}
        lastUpdatedAt="2021-10-01T12:00:00Z"
      />,
    );

    const ellipsisButton = screen.getByTestId("ellipsis-button");
    await user.click(ellipsisButton);

    const menu = screen.getByTestId("context-menu");
    const deleteButton = within(menu).getByTestId("delete-button");

    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalled();
  });

  test("conversation title should call onChangeTitle when changed and enter is hit", async () => {
    const user = userEvent.setup();
    render(
      <ConversationCard
        conversationID="deadbeef"
        onDelete={onDelete}
        isActive
        title="Conversation 1"
        selectedRepository={null}
        lastUpdatedAt="2021-10-01T12:00:00Z"
        onChangeTitle={onChangeTitle}
      />,
    );

    let title = screen.getByTestId("conversation-card-title");
    expect(title).toHaveTextContent("Conversation 1");

    await clickOnEditButton(user);
    const titleInput = screen.getByTestId("conversation-card-title-input");

    expect(titleInput).toBeEnabled();
    expect(screen.queryByTestId("context-menu")).not.toBeInTheDocument();
    // expect to be focused
    expect(document.activeElement).toBe(titleInput);

    await user.clear(titleInput);
    await user.type(titleInput, "New Conversation Name   ");
    await user.keyboard("{Enter}");
    // Wait for the form submission to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(onChangeTitle).toHaveBeenCalledWith("New Conversation Name");
    title = screen.getByTestId("conversation-card-title");
    expect(title).toHaveTextContent("New Conversation Name");
  });

  it("should reset title and not call onChangeTitle when the title is empty", async () => {
    const user = userEvent.setup();
    render(
      <ConversationCard
        conversationID="deadbeef"
        onDelete={onDelete}
        isActive
        onChangeTitle={onChangeTitle}
        title="Conversation 1"
        selectedRepository={null}
        lastUpdatedAt="2021-10-01T12:00:00Z"
      />,
    );

    await clickOnEditButton(user);

    const title = screen.getByTestId("conversation-card-title-input");

    await user.clear(title);
    const enterEvent = new KeyboardEvent('keyup', { key: 'Enter' });
    title.dispatchEvent(enterEvent);

    expect(onChangeTitle).not.toHaveBeenCalled();
    expect(title).toHaveValue("Conversation 1");
  });

  it("should call onDownloadWorkspace when the download button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ConversationCard
        conversationID="deadbeef"
        onDelete={onDelete}
        onChangeTitle={onChangeTitle}
        onDownloadWorkspace={onDownloadWorkspace}
        title="Conversation 1"
        selectedRepository={null}
        lastUpdatedAt="2021-10-01T12:00:00Z"
      />,
    );

    const ellipsisButton = screen.getByTestId("ellipsis-button");
    await user.click(ellipsisButton);

    const menu = screen.getByTestId("context-menu");
    const downloadButton = within(menu).getByTestId("download-button");

    await user.click(downloadButton);

    expect(onDownloadWorkspace).toHaveBeenCalled();
  });

  it("should not display the edit or delete options if the handler is not provided", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ConversationCard
        conversationID="deadbeef"
        onChangeTitle={onChangeTitle}
        title="Conversation 1"
        selectedRepository={null}
        lastUpdatedAt="2021-10-01T12:00:00Z"
      />,
    );

    const ellipsisButton = screen.getByTestId("ellipsis-button");
    await user.click(ellipsisButton);

    expect(screen.queryByTestId("edit-button")).toBeInTheDocument();
    expect(screen.queryByTestId("delete-button")).not.toBeInTheDocument();

    // toggle to hide the context menu
    await user.click(ellipsisButton);

    rerender(
      <ConversationCard
        conversationID="deadbeef"
        onDelete={onDelete}
        title="Conversation 1"
        selectedRepository={null}
        lastUpdatedAt="2021-10-01T12:00:00Z"
      />,
    );

    await user.click(ellipsisButton);

    expect(screen.queryByTestId("edit-button")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-button")).toBeInTheDocument();
  });

  it("should not render the ellipsis button if there are no actions", () => {
    const { rerender } = render(
      <ConversationCard
        conversationID="deadbeef"
        onDelete={onDelete}
        onChangeTitle={onChangeTitle}
        onDownloadWorkspace={onDownloadWorkspace}
        title="Conversation 1"
        selectedRepository={null}
        lastUpdatedAt="2021-10-01T12:00:00Z"
      />,
    );

    expect(screen.getByTestId("ellipsis-button")).toBeInTheDocument();

    rerender(
      <ConversationCard
        conversationID="deadbeef"
        onDelete={onDelete}
        onDownloadWorkspace={onDownloadWorkspace}
        title="Conversation 1"
        selectedRepository={null}
        lastUpdatedAt="2021-10-01T12:00:00Z"
      />,
    );

    expect(screen.getByTestId("ellipsis-button")).toBeInTheDocument();

    rerender(
      <ConversationCard
        conversationID="deadbeef"
        onDownloadWorkspace={onDownloadWorkspace}
        title="Conversation 1"
        selectedRepository={null}
        lastUpdatedAt="2021-10-01T12:00:00Z"
      />,
    );

    expect(screen.queryByTestId("ellipsis-button")).toBeInTheDocument();

    rerender(
      <ConversationCard
        conversationID="deadbeef"
        title="Conversation 1"
        selectedRepository={null}
        lastUpdatedAt="2021-10-01T12:00:00Z"
      />,
    );

    expect(screen.queryByTestId("ellipsis-button")).not.toBeInTheDocument();
  });

  describe("state indicator", () => {
    it("should render the 'STOPPED' indicator by default", () => {
      render(
        <ConversationCard
        conversationID="deadbeef"
          onDelete={onDelete}
          isActive
          onChangeTitle={onChangeTitle}
          title="Conversation 1"
          selectedRepository={null}
          lastUpdatedAt="2021-10-01T12:00:00Z"
        />,
      );

      screen.getByTestId("STOPPED-indicator");
    });

    it("should render the other indicators when provided", () => {
      render(
        <ConversationCard
        conversationID="deadbeef"
          onDelete={onDelete}
          isActive
          onChangeTitle={onChangeTitle}
          title="Conversation 1"
          selectedRepository={null}
          lastUpdatedAt="2021-10-01T12:00:00Z"
          status="RUNNING"
        />,
      );

      expect(screen.queryByTestId("STOPPED-indicator")).not.toBeInTheDocument();
      screen.getByTestId("RUNNING-indicator");
    });
  });
});
