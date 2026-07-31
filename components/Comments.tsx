'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiReady } from '@/lib/api';
import { useSite } from '@/components/Providers';
import { T } from '@/components/T';
import type { Lang } from '@/lib/i18n';

type C = { t: string; post: string; name: string; body: string };

const M: Record<Lang, Record<string, string>> = {
  jp: { none: 'まだコメントはありません。最初の一言をどうぞ。', off: 'ただいまコメント欄の準備中です。', need: 'コメントを入力してください。', sending: '投稿しています…', ok: 'コメントを受け付けました。確認のうえ掲載いたします。', ng: '投稿できませんでした。しばらくしてからお試しください。', anon: '名無しさん' },
  en: { none: 'No comments yet. Be the first to write one.', off: 'The comment section is not ready yet.', need: 'Please write a comment.', sending: 'Posting…', ok: 'Thank you. Your comment has been received and will appear once we have checked it.', ng: 'The comment could not be posted. Please try again shortly.', anon: 'Anonymous' },
  fr: { none: 'Aucun commentaire pour l’instant. Écrivez le premier.', off: 'Les commentaires ne sont pas encore actifs.', need: 'Merci d’écrire un commentaire.', sending: 'Publication…', ok: 'Merci. Votre commentaire a bien été reçu et paraîtra après vérification.', ng: 'La publication a échoué. Merci de réessayer bientôt.', anon: 'Anonyme' },
  zh: { none: '目前还没有留言。欢迎写下第一条。', off: '留言板尚在准备中。', need: '请填写留言内容。', sending: '发送中…', ok: '已收到您的留言，确认后将予以刊登。', ng: '发布失败，请稍后再试。', anon: '无名氏' },
  ko: { none: '아직 댓글이 없습니다. 첫 한마디를 남겨 주세요.', off: '댓글란을 준비 중입니다.', need: '댓글을 입력해 주세요.', sending: '올리는 중…', ok: '댓글을 등록했습니다. 감사합니다.', ng: '등록하지 못했습니다. 잠시 후 다시 시도해 주세요.', anon: '이름 없음' },
};

export function Comments({ post, all, reload }: { post: string; all: C[] | null; reload: () => void }) {
  const { lang } = useSite();
  const t = (k: string) => (M[lang] || M.jp)[k];
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<{ text: string; color: string } | null>(null);

  const list = (all || []).filter((c) => c.post === post);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const say = (k: string, c?: string) =>
      setStatus({ text: t(k), color: c === 'ok' ? '#9dff9d' : c === 'ng' ? '#ff8a8a' : '#b3a894' });
    if (!body.trim()) { say('need', 'ng'); return; }
    if (!apiReady()) { say('off', 'ng'); return; }
    say('sending');
    try {
      const r = await apiPost({ action: 'comment', post, name, body: body.trim(), hp });
      if (r && r.ok) { setBody(''); say('ok', 'ok'); reload(); } else say('ng', 'ng');
    } catch { say('ng', 'ng'); }
  };

  return (
    <div className="cmt" data-post={post}>
      <div className="hint" style={{ marginTop: 10 }}>
        ［ <T k="bl-cmt" as="span" /> <span className="cmt-n">({list.length})</span> ｜{' '}
        <a href="#" className="cmt-toggle" onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}>
          <T k="bl-cmt-write" as="span" />
        </a> ］
      </div>
      <div className="cmt-list" style={{ marginTop: 8 }}>
        {list.length === 0 ? (
          <div className="hint">{t('none')}</div>
        ) : (
          list.map((c, i) => (
            <div key={i} style={{ borderTop: '1px dashed #5a4626', padding: '8px 0' }} className="x-dash">
              <div className="x-gold" style={{ fontSize: 13 }}>
                {c.name || t('anon')} <span style={{ color: '#8a7f6b' }}>{c.t}</span>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', marginTop: 3 }}>{c.body}</div>
            </div>
          ))
        )}
      </div>
      <form className="cmt-form" onSubmit={submit}
        style={{ display: open ? 'block' : 'none', marginTop: 12, borderTop: '1px dashed #5a4626', paddingTop: 10 }}>
        <p style={{ display: 'none' }}>
          <label><input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} /></label>
        </p>
        <T k="bl-cmt-name" as="label" />
        <input className="field cmt-name" type="text" maxLength={60} placeholder="名無しさん" value={name} onChange={(e) => setName(e.target.value)} />
        <T k="bl-cmt-body" as="label" />
        <textarea className="field cmt-body" rows={4} required style={{ resize: 'vertical' }} value={body} onChange={(e) => setBody(e.target.value)} />
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <button className="btn" type="submit"><T k="bl-cmt-send" as="span" kind="btn" /></button>
        </div>
        <div className="cmt-status hint" style={{ marginTop: 8, minHeight: 18, color: status?.color }}>{status?.text}</div>
        <T k="bl-cmt-note" as="div" className="hint" style={{ marginTop: 4 }} />
      </form>
    </div>
  );
}

export function useComments() {
  const [all, setAll] = useState<C[] | null>(null);
  const load = () => {
    if (!apiReady()) { setAll([]); return; }
    apiGet({ action: 'comments' })
      .then((r) => setAll(r && r.ok ? r.items : []))
      .catch(() => setAll([]));
  };
  useEffect(load, []);
  return { all, reload: load };
}
