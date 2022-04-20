import * as React from 'react';
import { createMarkPositioner, LinkExtension, PositionerParam, ShortcutHandlerProps } from 'remirror/extensions';
import {
  ComponentItem,
  FloatingToolbar,
  FloatingWrapper,
  ToolbarItemUnion,
  useActive,
  useAttrs,
  useChainedCommands,
  useCurrentSelection,
  useExtension,
  useUpdateReason
} from '@remirror/react';
import { IconButton, InputBase, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import { flattenArray } from 'remirror';
import { MarkdownEditorContextValues, useMarkdownEditorContext } from './MarkdownEditor';

const useLinkShortcut = () => {
  const [linkShortcut, setLinkShortcut] = React.useState<ShortcutHandlerProps | undefined>();
  const [isEditing, setIsEditing] = React.useState(false);

  useExtension(
    LinkExtension,
    ({ addHandler }) =>
      addHandler('onShortcut', (props) => {
        if (!isEditing) {
          setIsEditing(true);
        }

        return setLinkShortcut(props);
      }),
    [isEditing]
  );

  return { linkShortcut, isEditing, setIsEditing };
};

export const useFloatingLinkState = (): Partial<MarkdownEditorContextValues> => {
  const chain = useChainedCommands();
  const { isEditing, linkShortcut, setIsEditing } = useLinkShortcut();
  const { to, empty } = useCurrentSelection();

  const url = (useAttrs().link()?.href as string) ?? '';
  const [href, setHref] = React.useState<string>(url);

  // A positioner which only shows for links.
  const linkPositioner = React.useMemo(() => createMarkPositioner({ type: 'link' }), []);

  const onRemove = React.useCallback(() => {
    return chain.removeLink().focus().run();
  }, [chain]);

  const updateReason = useUpdateReason();

  React.useLayoutEffect(() => {
    if (!isEditing) {
      return;
    }

    if (updateReason.doc || updateReason.selection) {
      setIsEditing(false);
    }
  }, [isEditing, setIsEditing, updateReason.doc, updateReason.selection]);

  React.useEffect(() => {
    setHref(url);
  }, [url]);

  const submitHref = React.useCallback(() => {
    setIsEditing(false);
    const range = linkShortcut ?? undefined;

    if (href === '') {
      chain.removeLink();
    } else {
      chain.updateLink({ href, auto: false }, range);
      setHref('');
    }

    chain.focus(range?.to ?? to).run();
  }, [setIsEditing, linkShortcut, chain, href, to]);

  const cancelHref = React.useCallback(() => {
    setIsEditing(false);
  }, [setIsEditing]);

  const clickEdit = React.useCallback(() => {
    if (empty) {
      chain.selectLink();
    }
    setIsEditing(true);
  }, [chain, empty, setIsEditing]);

  return React.useMemo(
    () => ({
      href,
      setHref,
      linkShortcut,
      linkPositioner,
      isEditing,
      clickEdit,
      onRemove,
      submitHref,
      cancelHref
    }),
    [href, linkShortcut, linkPositioner, isEditing, clickEdit, onRemove, submitHref, cancelHref]
  );
};

const FloatingLinkToolbar = () => {
  const { isLoaded, isEditing, linkPositioner, clickEdit, onRemove, submitHref, href, setHref, cancelHref } = useMarkdownEditorContext();
  const active = useActive();
  const activeLink = active.link();
  const { empty } = useCurrentSelection();
  const linkEditItems: ToolbarItemUnion[] = React.useMemo(
    () => [
      {
        type: ComponentItem.ToolbarGroup,
        label: 'Link',
        items: flattenArray([
          { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleBold', display: 'icon' },
          { type: ComponentItem.ToolbarCommandButton, commandName: 'toggleItalic', display: 'icon' },
          { type: ComponentItem.ToolbarButton, onClick: () => clickEdit?.(), icon: 'link' },
          activeLink ? [{ type: ComponentItem.ToolbarButton, onClick: onRemove, icon: 'linkUnlink' }] : []
        ])
      }
    ],
    [clickEdit, onRemove, activeLink]
  );

  const items: ToolbarItemUnion[] = React.useMemo(() => linkEditItems, [linkEditItems]);

  if (isLoaded) {
    return (
      <>
        <FloatingToolbar items={items} positioner="selection" placement="top" enabled={!isEditing} />
        <FloatingToolbar
          items={linkEditItems}
          positioner={linkPositioner as PositionerParam}
          placement="bottom"
          enabled={!isEditing && empty}
        />
        <LinkForm isEditing={isEditing} submitHref={submitHref} href={href} setHref={setHref} cancelHref={cancelHref} />
      </>
    );
  }
  return <></>;
};

export const LinkForm = ({ isEditing, submitHref, href, setHref, cancelHref }: any) => {
  return (
    <FloatingWrapper positioner="always" placement="bottom" enabled={isEditing} renderOutsideEditor>
      <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}>
        <InputBase
          size="small"
          sx={{ ml: 1, flex: 1 }}
          placeholder="Enter link..."
          inputProps={{ 'aria-label': 'Link (href)' }}
          onChange={(event) => setHref(event.target.value)}
          autoFocus
          value={href}
          onKeyPress={(event) => {
            const { code } = event;
            if (code === 'Enter') {
              submitHref();
            }
            if (code === 'Escape') {
              cancelHref();
            }
          }}
        />
        <IconButton size="small" onClick={() => cancelHref()}>
          <CloseIcon />
        </IconButton>
        <IconButton size="small" onClick={() => submitHref()} color="primary">
          <DoneIcon />
        </IconButton>
      </Paper>
    </FloatingWrapper>
  );
};

export default FloatingLinkToolbar;
