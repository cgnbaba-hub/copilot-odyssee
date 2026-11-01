import * as React from 'react';

import { cleanPost, NewPinPost, PIN_PROMPT_MAX, PIN_TITLE_MAX, PIN_TOOLS, PinboardData, PinOrder, PinPost, PinTool, sensitiveHints, sortPosts } from '../../core/pinboard/pinboard';
import { sharePin } from '../../core/progress/state';
import { APP_NAMES, COPILOT_CHAT_URL, copyText, CopyState } from '../copilot';
import { formatDate } from '../format';
import { useGame } from '../GameContext';
import { format, Strings } from '../i18n/strings';
import { playerArea } from '../progressHelpers';
import styles from '../styles.module.scss';
import { Guide } from './Guide';
import { Loading } from './Loading';
import { SheetTabs } from './SheetTabs';

type Load = { status: 'loading' } | { status: 'failed' } | { status: 'ready'; data: PinboardData };

const ALL_AREAS = '';
/** Longer prompts are folded until opened. */
const FOLD_CHARS = 320;

function toolName(strings: Strings, tool: PinTool): string {
  return tool === 'chat' ? strings.pinboardToolChat : APP_NAMES[tool];
}

/** One note on the board: prompt, where it is used, who shared it and how many it helped. */
function PinCard(props: { post: PinPost; onLike: () => void; onModerate?: (approve: boolean) => void }): React.ReactElement {
  const { content, lang, strings, t } = useGame();
  const { post } = props;
  const [copyState, setCopyState] = React.useState<CopyState>('idle');
  const [open, setOpen] = React.useState(false);
  const textRef = React.useRef<HTMLParagraphElement>(null);
  const area = (content.areas || []).filter((a) => a.id === post.area)[0];
  const folded = post.prompt.length > FOLD_CHARS && !open;
  const by = post.mine ? strings.pinboardMine : post.author || strings.pinboardAnonymous;
  const helped = post.likes === 1 ? strings.pinboardHelpedOne : format(strings.pinboardHelpedCount, { count: post.likes });

  return (
    <li className={`${styles.pinCard} ${post.status !== 'approved' ? styles.pinCardWaiting : ''}`}>
      <span className={styles.pinNeedle} aria-hidden="true" />
      <div className={styles.pinChips}>
        <span className={styles.chip}>{toolName(strings, post.tool)}</span>
        {area && <span className={styles.chip}>{t(area.name)}</span>}
        {post.status === 'pending' && <span className={styles.pinStatus}>{strings.pinboardPending}</span>}
        {post.status === 'rejected' && <span className={`${styles.pinStatus} ${styles.pinStatusRejected}`}>{strings.pinboardRejected}</span>}
      </div>
      <h3 className={styles.pinTitle}>{post.title}</h3>
      <p className={`${styles.pinText} ${folded ? styles.pinTextFolded : ''}`} ref={textRef}>
        {post.prompt}
      </p>
      {post.prompt.length > FOLD_CHARS && (
        <button type="button" className={styles.linkButton} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? strings.pinboardShowLess : strings.pinboardShowMore}
        </button>
      )}
      <p className={styles.pinBy}>
        {by} · {post.created ? formatDate(lang, post.created) : ''}
      </p>
      {props.onModerate ? (
        <div className={styles.pinActions}>
          <button type="button" className={styles.buttonSuccess} onClick={() => props.onModerate && props.onModerate(true)}>
            ✓ {strings.pinboardApprove}
          </button>
          <button type="button" className={styles.button} onClick={() => props.onModerate && props.onModerate(false)}>
            {strings.pinboardReject}
          </button>
        </div>
      ) : (
        <div className={styles.pinActions}>
          <button
            type="button"
            className={copyState === 'copied' ? styles.buttonSuccess : styles.buttonPrimary}
            onClick={() => copyText(post.prompt, textRef.current || undefined, setCopyState)}
          >
            {copyState === 'copied' ? `✓ ${strings.copied}` : `⧉ ${strings.copy}`}
          </button>
          {post.tool === 'chat' && (
            <a className={styles.button} href={COPILOT_CHAT_URL} target="_blank" rel="noopener noreferrer">
              {strings.missionOpenCopilot} ↗
            </a>
          )}
          {post.status === 'approved' && (
            <button
              type="button"
              className={`${styles.pinLike} ${post.liked ? styles.pinLikeOn : ''}`}
              aria-pressed={post.liked}
              title={helped}
              onClick={props.onLike}
              disabled={post.mine}
            >
              <span aria-hidden="true">👍</span> {strings.pinboardHelped}
              <b aria-label={helped}>{post.likes}</b>
            </button>
          )}
        </div>
      )}
      {copyState === 'failed' && <p className={styles.copyFailed}>{strings.missionCopyFailed}</p>}
    </li>
  );
}

type FormStatus = 'editing' | 'sending' | 'sent' | 'failed';

/** The form to pin a prompt; warns about anything that looks like personal data. */
function PinForm(props: { draft?: { title: string; prompt: string }; onSent: () => void; onCancel: () => void }): React.ReactElement {
  const game = useGame();
  const { content, strings, t, apply, pinboard } = game;
  const ownArea = playerArea(game);
  const [title, setTitle] = React.useState(props.draft ? props.draft.title.slice(0, PIN_TITLE_MAX) : '');
  const [prompt, setPrompt] = React.useState(props.draft ? props.draft.prompt : '');
  const [tool, setTool] = React.useState<PinTool>('chat');
  const [area, setArea] = React.useState(ownArea ? ownArea.id : ALL_AREAS);
  const [showName, setShowName] = React.useState(false);
  const [status, setStatus] = React.useState<FormStatus>('editing');
  const input: NewPinPost = { title, prompt, tool, area: area || undefined, showName };
  const post = cleanPost(input);
  const hints = sensitiveHints(`${title} ${prompt}`);
  const hintNames = { mail: strings.pinboardSensitiveMail, phone: strings.pinboardSensitivePhone, iban: strings.pinboardSensitiveIban };

  if (status === 'sent') {
    return (
      <div className={styles.feedbackGood} role="status">
        <p>
          <strong>{strings.pinboardSent}</strong>
        </p>
        <div className={styles.blockActions}>
          <button type="button" className={styles.buttonPrimary} onClick={props.onSent}>
            {strings.close}
          </button>
        </div>
      </div>
    );
  }

  const send = (): void => {
    if (!post || !pinboard) return;
    setStatus('sending');
    pinboard.add(post).then(
      () => {
        apply((s) => sharePin(s));
        setStatus('sent');
      },
      () => setStatus('failed')
    );
  };

  return (
    <form
      className={styles.pinForm}
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <h2 className={styles.sectionTitle}>{strings.pinboardFormTitle}</h2>
      <label className={styles.feedbackField}>
        <span>{strings.pinboardFieldTitle}</span>
        <input className={styles.input} value={title} maxLength={PIN_TITLE_MAX} placeholder={strings.pinboardFieldTitlePlaceholder} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className={styles.feedbackField}>
        <span>{strings.pinboardFieldPrompt}</span>
        <textarea
          className={styles.textarea}
          rows={6}
          maxLength={PIN_PROMPT_MAX}
          value={prompt}
          placeholder={strings.pinboardFieldPromptPlaceholder}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </label>
      <div className={styles.pinFormRow}>
        <label className={styles.feedbackField}>
          <span>{strings.pinboardFieldTool}</span>
          <select className={styles.input} value={tool} onChange={(e) => setTool(e.target.value as PinTool)}>
            {PIN_TOOLS.map((x) => (
              <option key={x} value={x}>
                {toolName(strings, x)}
              </option>
            ))}
          </select>
        </label>
        {(content.areas || []).length > 0 && (
          <label className={styles.feedbackField}>
            <span>{strings.pinboardFieldArea}</span>
            <select className={styles.input} value={area} onChange={(e) => setArea(e.target.value)}>
              <option value={ALL_AREAS}>{strings.pinboardAnyArea}</option>
              {(content.areas || []).map((a) => (
                <option key={a.id} value={a.id}>
                  {t(a.name)}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <label className={styles.feedbackCheck}>
        <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} />
        <span>{strings.pinboardShowName}</span>
      </label>
      {hints.length > 0 && (
        <p className={styles.pinWarning} role="alert">
          {format(strings.pinboardSensitive, { what: hints.map((h) => hintNames[h]).join(', ') })}
        </p>
      )}
      <p className={styles.muted}>{strings.pinboardPrivacy}</p>
      {!post && (title || prompt) && <p className={styles.muted}>{strings.pinboardIncomplete}</p>}
      {status === 'failed' && (
        <p className={styles.feedbackBad} role="alert">
          {strings.pinboardSendFailed}
        </p>
      )}
      <div className={styles.blockActions}>
        <button type="submit" className={styles.buttonPrimary} disabled={!post || status === 'sending'}>
          📌 {status === 'sending' ? strings.pinboardSubmitting : strings.pinboardSubmit}
        </button>
        <button type="button" className={styles.button} onClick={props.onCancel}>
          {strings.cancel}
        </button>
      </div>
    </form>
  );
}

/**
 * The harbour board: prompts colleagues found useful, most helpful first,
 * filtered by field of work. The editorial team approves new posts here.
 */
export function Pinboard(props: { draft?: { title: string; prompt: string } }): React.ReactElement {
  const game = useGame();
  const { content, strings, t, navigate, pinboard } = game;
  const [load, setLoad] = React.useState<Load>({ status: 'loading' });
  const [reload, setReload] = React.useState(0);
  const [order, setOrder] = React.useState<PinOrder>('popular');
  const [filter, setFilter] = React.useState(ALL_AREAS);
  const [formOpen, setFormOpen] = React.useState(!!props.draft);
  const [actionFailed, setActionFailed] = React.useState(false);

  React.useEffect(() => {
    if (!pinboard) return undefined;
    let active = true;
    pinboard.load().then(
      (data) => active && setLoad({ status: 'ready', data }),
      () => active && setLoad({ status: 'failed' })
    );
    return () => {
      active = false;
    };
  }, [pinboard, reload]);

  const change = (postId: string, patch: (p: PinPost) => PinPost | undefined): void => {
    if (load.status !== 'ready') return;
    const posts = load.data.posts.map((p) => (p.id === postId ? patch(p) : p)).filter((p): p is PinPost => !!p);
    setLoad({ status: 'ready', data: { ...load.data, posts } });
  };

  const like = (post: PinPost): void => {
    if (!pinboard) return;
    const liked = !post.liked;
    setActionFailed(false);
    change(post.id, (p) => ({ ...p, liked, likes: p.likes + (liked ? 1 : -1) }));
    pinboard.setLike(post.id, liked).catch(() => {
      setActionFailed(true);
      setReload((n) => n + 1);
    });
  };

  const moderate = (post: PinPost, approve: boolean): void => {
    if (!pinboard) return;
    setActionFailed(false);
    change(post.id, (p) => ({ ...p, status: approve ? 'approved' : 'rejected' }));
    pinboard.moderate(post.id, approve).catch(() => {
      setActionFailed(true);
      setReload((n) => n + 1);
    });
  };

  let body: React.ReactElement;
  if (!pinboard || load.status === 'failed') {
    body = (
      <div className={styles.pinEmpty}>
        <p>{strings.pinboardLoadFailed}</p>
        {pinboard && (
          <button
            type="button"
            className={styles.button}
            onClick={() => {
              setLoad({ status: 'loading' });
              setReload((n) => n + 1);
            }}
          >
            {strings.pinboardRetry}
          </button>
        )}
      </div>
    );
  } else if (load.status === 'loading') {
    body = <Loading text={strings.loading} compact />;
  } else {
    const { posts, canModerate } = load.data;
    const waiting = canModerate ? posts.filter((p) => p.status === 'pending') : [];
    const visible = sortPosts(
      posts.filter((p) => waiting.indexOf(p) < 0 && (p.status === 'approved' || p.mine) && (!filter || !p.area || p.area === filter)),
      order
    );
    body = (
      <>
        {waiting.length > 0 && (
          <section className={styles.pinModerate} aria-labelledby="od-pin-moderate">
            <h2 className={styles.sectionTitle} id="od-pin-moderate">
              {format(strings.pinboardModerate, { count: waiting.length })}
            </h2>
            <p className={styles.muted}>{strings.pinboardModerateHint}</p>
            <ul className={styles.pinGrid}>
              {waiting.map((p) => (
                <PinCard key={p.id} post={p} onLike={() => undefined} onModerate={(approve) => moderate(p, approve)} />
              ))}
            </ul>
          </section>
        )}
        <div className={styles.pinToolbar}>
          <div className={styles.viewSwitch} role="group" aria-label={strings.pinboardSort}>
            <button type="button" aria-pressed={order === 'popular'} className={order === 'popular' ? styles.viewSwitchActive : undefined} onClick={() => setOrder('popular')}>
              {strings.pinboardSortPopular}
            </button>
            <button type="button" aria-pressed={order === 'new'} className={order === 'new' ? styles.viewSwitchActive : undefined} onClick={() => setOrder('new')}>
              {strings.pinboardSortNew}
            </button>
          </div>
          {(content.areas || []).length > 0 && (
            <label className={styles.filterLabel}>
              {strings.pinboardFilter}
              <select className={styles.input} value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value={ALL_AREAS}>{strings.allAreas}</option>
                {(content.areas || []).map((a) => (
                  <option key={a.id} value={a.id}>
                    {t(a.name)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        {visible.length > 0 ? (
          <ul className={styles.pinGrid}>
            {visible.map((p) => (
              <PinCard key={p.id} post={p} onLike={() => like(p)} />
            ))}
          </ul>
        ) : (
          <p className={styles.pinEmpty}>{filter ? strings.pinboardEmptyFilter : strings.pinboardEmpty}</p>
        )}
      </>
    );
  }

  return (
    <section className={styles.panel}>
      <button type="button" className={styles.backButton} onClick={() => navigate({ name: 'map' })}>
        ← {strings.backToOverview}
      </button>
      <SheetTabs active="pinboard" />
      <div className={styles.pinHead}>
        <h1 className={styles.pageTitle}>
          <span aria-hidden="true">📌</span> {strings.pinboardTitle}
        </h1>
        {!formOpen && pinboard && (
          <button type="button" className={`${styles.buttonPrimary} ${styles.buttonBig}`} onClick={() => setFormOpen(true)}>
            + {strings.pinboardShare}
          </button>
        )}
      </div>
      <Guide text={strings.pinboardGuide} />
      {pinboard && pinboard.sample && <p className={styles.pinDemo}>{strings.pinboardDemo}</p>}
      {formOpen && (
        <PinForm
          draft={props.draft}
          onCancel={() => setFormOpen(false)}
          onSent={() => {
            setFormOpen(false);
            setReload((n) => n + 1);
          }}
        />
      )}
      {actionFailed && (
        <p className={styles.feedbackBad} role="alert">
          {strings.pinboardActionFailed}
        </p>
      )}
      <div className={styles.pinBoard}>{body}</div>
    </section>
  );
}
