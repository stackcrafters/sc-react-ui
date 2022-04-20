import '@remirror/styles/all.css';
import './custom.css';
import * as React from 'react';
import jsx from 'refractor/lang/jsx';
import typescript from 'refractor/lang/typescript';
import { ExtensionPriority, flattenArray } from 'remirror';
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CodeBlockExtension,
  CodeExtension,
  HardBreakExtension,
  HeadingExtension,
  IframeExtension,
  ImageExtension,
  ItalicExtension,
  LinkExtension,
  ListItemExtension,
  MarkdownExtension,
  OrderedListExtension,
  PlaceholderExtension,
  ShortcutHandlerProps,
  StrikeExtension,
  TableExtension,
  TrailingNodeExtension,
  PositionerParam
} from 'remirror/extensions';
import {
  ComponentItem,
  EditorComponent,
  Remirror,
  ThemeProvider,
  Toolbar,
  ToolbarItemUnion,
  useActive,
  useCurrentSelection,
  useHelpers,
  useRemirror
} from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';
import { htmlToMarkdown } from './html-to-markdown';
import FloatingLinkToolbar, { LinkForm, useFloatingLinkState } from './Link';
import { ButtonClickHandler } from '@remirror/react-components/dist/declarations/src/react-component-types';

export type MarkdownEditorProps = {
  placeholder?: string;
  initialContent?: string;
  toolbarMediaHandler?: ButtonClickHandler;
  appendMedia?: () => void;
  toolbarIframeHandler?: ButtonClickHandler;
  appendIframe?: () => void;
};

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ placeholder, initialContent, children }) => {
  return (
    <RemirrorMarkdownEditor initialContent={initialContent}>
      <MarkdownPreview />
    </RemirrorMarkdownEditor>
  );
};

const MarkdownPreview: React.FC = () => {
  const { getMarkdown } = useHelpers(true);

  return (
    <pre>
      <code>{getMarkdown()}</code>
    </pre>
  );
};

const RemirrorMarkdownEditor: React.FC<MarkdownEditorProps> = ({
  placeholder,
  initialContent,
  toolbarMediaHandler,
  appendMedia,
  toolbarIframeHandler,
  appendIframe,
  children
}) => {
  const extensions = React.useCallback(
    () => [
      new PlaceholderExtension({ placeholder }),
      new LinkExtension({ autoLink: true }),
      new BoldExtension(),
      new StrikeExtension(),
      new ItalicExtension(),
      new HeadingExtension(),
      new LinkExtension(),
      new BlockquoteExtension(),
      new BulletListExtension({ enableSpine: false }),
      new OrderedListExtension(),
      new ListItemExtension({ priority: ExtensionPriority.High, enableCollapsible: false }),
      new CodeExtension(),
      new CodeBlockExtension({ supportedLanguages: [jsx, typescript] }),
      new TrailingNodeExtension(),
      new TableExtension(),
      new ImageExtension(),
      new IframeExtension({ enableResizing: false }),
      new MarkdownExtension({ copyAsMarkdown: true, htmlToMarkdown: htmlToMarkdown }),
      /**
       * `HardBreakExtension` allows us to create a newline inside paragraphs.
       * e.g. in a list item
       */
      new HardBreakExtension()
    ],
    [placeholder]
  );

  const { manager } = useRemirror({
    extensions,
    stringHandler: 'markdown'
  });

  return (
    <ThemeProvider>
      <AllStyledComponent>
        <Remirror manager={manager} autoFocus initialContent={initialContent}>
          <MarkdownEditorProvider>
            <ToolbarMenu toolbarMediaHandler={toolbarMediaHandler} toolbarIframeHandler={toolbarIframeHandler} />
            <EditorComponent />
            <FloatingLinkToolbar />
            {children}
          </MarkdownEditorProvider>
        </Remirror>
      </AllStyledComponent>
    </ThemeProvider>
  );
};

export default MarkdownEditor;

export interface MarkdownEditorContextValues {
  isLoaded: boolean;
  isEditing: boolean;
  linkPositioner: PositionerParam;
  clickEdit: () => void;
  onRemove: () => void;
  submitHref: () => void;
  href: string;
  setHref: (value: ((prevState: string) => string) | string) => void;
  cancelHref: () => void;
  linkShortcut: ShortcutHandlerProps;
}
const initialState = { isLoaded: false };

export const MarkdownEditorContext = React.createContext<MarkdownEditorContextValues | {}>(initialState);
export const useMarkdownEditorContext = (): Partial<MarkdownEditorContextValues> => React.useContext(MarkdownEditorContext);
export const MarkdownEditorProvider: React.FC = ({ children }) => {
  const floatingLinkState = useFloatingLinkState();
  if (floatingLinkState) {
    return <MarkdownEditorContext.Provider value={{ isLoaded: true, ...floatingLinkState }}>{children}</MarkdownEditorContext.Provider>;
  }
  return <>children</>;
};

const ToolbarMenu = ({
  toolbarMediaHandler,
  toolbarIframeHandler
}: Pick<MarkdownEditorProps, 'toolbarMediaHandler' | 'toolbarIframeHandler'>) => {
  const { isLoaded, isEditing, clickEdit, onRemove, submitHref, href, setHref, cancelHref } = useMarkdownEditorContext();
  const active = useActive();
  const activeLink = active.link();
  const { empty } = useCurrentSelection();

  const toolbarItems: ToolbarItemUnion[] = [
    {
      type: ComponentItem.ToolbarGroup,
      label: 'Simple Formatting',
      items: flattenArray([
        { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleBold', display: 'icon' },
        { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleItalic', display: 'icon' },
        { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleStrike', display: 'icon' },
        { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleCode', display: 'icon' },
        { type: ComponentItem.ToolbarButton, onClick: () => clickEdit?.(), icon: 'link', disabled: empty },
        activeLink ? [{ type: ComponentItem.ToolbarButton, onClick: onRemove, icon: 'linkUnlink' }] : []
      ]),
      separator: 'end'
    },
    {
      type: ComponentItem.ToolbarGroup,
      label: 'Heading Formatting',
      items: [
        {
          type: ComponentItem.ToolbarCommandButton,
          commandName: 'toggleHeading',
          display: 'icon',
          attrs: { level: 1 }
        },
        {
          type: ComponentItem.ToolbarCommandButton,
          commandName: 'toggleHeading',
          display: 'icon',
          attrs: { level: 2 }
        },
        {
          type: ComponentItem.ToolbarMenu,

          items: [
            {
              type: ComponentItem.MenuGroup,
              role: 'radio',
              items: [
                {
                  type: ComponentItem.MenuCommandPane,
                  commandName: 'toggleHeading',
                  attrs: { level: 3 }
                },
                {
                  type: ComponentItem.MenuCommandPane,
                  commandName: 'toggleHeading',
                  attrs: { level: 4 }
                },
                {
                  type: ComponentItem.MenuCommandPane,
                  commandName: 'toggleHeading',
                  attrs: { level: 5 }
                },
                {
                  type: ComponentItem.MenuCommandPane,
                  commandName: 'toggleHeading',
                  attrs: { level: 6 }
                }
              ]
            }
          ]
        }
      ],
      separator: 'end'
    },
    {
      type: ComponentItem.ToolbarGroup,
      label: 'Simple Formatting',
      items: [
        {
          type: ComponentItem.ToolbarCommandButton,
          commandName: 'toggleBlockquote',
          display: 'icon'
        },
        { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleCodeBlock', display: 'icon' },
        { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleBulletList', display: 'icon' },
        { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleOrderedList', display: 'icon' }
      ],
      separator: 'end'
    },
    {
      type: ComponentItem.ToolbarGroup,
      label: 'Simple Formatting',
      items: flattenArray([
        toolbarMediaHandler
          ? [
              {
                type: ComponentItem.ToolbarButton,
                onClick: toolbarMediaHandler,
                icon: 'imageLine'
              }
            ]
          : [],
        toolbarIframeHandler
          ? [
              {
                type: ComponentItem.ToolbarButton,
                onClick: toolbarIframeHandler,
                icon: 'codeView'
              }
            ]
          : []
      ]),
      separator: 'end'
    },
    {
      type: ComponentItem.ToolbarGroup,
      label: 'History',
      items: [
        { type: ComponentItem.ToolbarCommandButton, commandName: 'undo', display: 'icon' },
        { type: ComponentItem.ToolbarCommandButton, commandName: 'redo', display: 'icon' },
        {
          type: ComponentItem.ToolbarCommandButton,
          commandName: 'toggleColumns',
          display: 'icon',
          attrs: { count: 2 }
        }
      ],
      separator: 'none'
    }
  ];
  const items: ToolbarItemUnion[] = React.useMemo(() => toolbarItems, [toolbarItems]);

  if (isLoaded) {
    return (
      <>
        <Toolbar items={items} refocusEditor label="Top Toolbar" />
        <LinkForm isEditing={isEditing} submitHref={submitHref} href={href} setHref={setHref} cancelHref={cancelHref} />
      </>
    );
  }
  return <></>;
};

//manager.commands.addIframe({ src: 'https://remirror.io/', height: 250, width: 500 });
