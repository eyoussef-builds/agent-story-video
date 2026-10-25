# التثبيت خطوة بخطوة على 15 مساعدًا

[English](agent-installation.md) · [الشرح الرئيسي](../README.ar.md)

اعتبر المهارة كتيّبًا صغيرًا يحتاج المساعد وضعه على رف يعرف مكانه. سننزّل الكتيّب، ونضعه على الرف المناسب، ثم نطلب من المساعد قراءته. لا تحتاج تعديل الكود.

## 1. نزّل المجلد مرة واحدة

1. افتح [صفحة المستودع](https://github.com/eyoussef-builds/agent-story-video).
2. اضغط الزر الأخضر **Code** ثم **Download ZIP**.
3. فك الضغط. افتح المجلد الناتج الذي يحتوي `README.md` ومجلد `skills`.
4. تأكد من وجود `skills/agent-story-video/SKILL.md`. انقل مجلد `agent-story-video` كاملًا بمجلدات `template/` و`references/` و`evals/` وبرامجه، وليس ملف `SKILL.md` وحده.
5. اختر مساعدك من الأقسام التالية. ثبّت نسخة واحدة في مكان واحد؛ لا تحتاج كل المجلدات.

أو، إذا كان Git مثبتًا، افتح Terminal أو PowerShell داخل مجلد تنزيل مناسب ونفّذ:

```sh
git clone https://github.com/eyoussef-builds/agent-story-video.git
cd agent-story-video
```

المهارة هنا مجلد محلي وليست إضافة متجر مسجّلة. لا تحتاج تثبيت كل المساعدين؛ يكفي مساعد واحد مثبت ومسجّل الدخول.

## 2. كيف تنسخها؟

**دون أوامر:** لكل مساعد مكان مكتوب أدناه. `~` تعني مجلد حسابك الشخصي، وليست اسم شخص محدد. على macOS استخدم Finder ثم **Go → Go to Folder**. على Linux استخدم مدير الملفات وأظهر المجلدات المخفية عند الحاجة. على Windows افتح مجلد المستخدم ثم أنشئ المجلدات المكتوبة في مسار PowerShell. إذا لم يوجد المجلد المطلوب، أنشئ مجلداته داخل حسابك أولًا. انسخ مجلد المهارة كاملًا إليه. إذا وجدت نسخة قديمة، توقّف وقارنها قبل الاستبدال.

**باستخدام الأوامر:** افتح الطرفية داخل مجلد المستودع بعد فك الضغط. في قسم مساعدك ستجد سطرين: أحدهما لـmacOS/Linux والآخر لـPowerShell. اختر نظامك فقط، ثم شغّل كتلة النسخ المناسبة التالية في **نفس نافذة الطرفية**.

macOS / Linux، بعد ضبط `dest_parent` من قسم مساعدك:

```sh
if [ -e "$dest_parent/agent-story-video" ] || [ -L "$dest_parent/agent-story-video" ]; then
  echo "Already installed. Compare your existing copy before updating."
else
  mkdir -p "$dest_parent" && cp -R "skills/agent-story-video" "$dest_parent/"
fi
```

Windows PowerShell، بعد ضبط `$destParent` من قسم مساعدك:

```powershell
$skillDest = Join-Path $destParent 'agent-story-video'
if (Test-Path -LiteralPath $skillDest) { throw 'Already installed. Compare before updating.' }
New-Item -ItemType Directory -Force -Path $destParent | Out-Null
Copy-Item -LiteralPath 'skills/agent-story-video' -Destination $destParent -Recurse
```

إذا ظهر تنبيه «Already installed»، لم تتحدّث النسخة القديمة. احفظ تعديلاتك وقارن المجلدين أولًا. المجلد النهائي يجب أن يحتوي `agent-story-video/SKILL.md` مباشرة، وليس مجلدًا إضافيًا متداخلًا بنفس الاسم.

أماكن التثبيت متوافقة مع الوثائق الرسمية المرتبطة كما رُوجعت بتاريخ 2026-10-21. هذه مراجعة للوثائق فقط: المهارة **جُرّبت من البداية للنهاية على Claude Code (تطبيق سطح المكتب على macOS)** فقط، وليس على الـ14 مساعدًا الباقين. قد تختلف الإصدارات وسياسات المؤسسات. إعادة فتح الجلسة أو تحميل المهارات قد تكون مطلوبة.

**ما الذي تحتاجه المهارة من المساعد:** صلاحية تشغيل أوامر الطرفية على جهازك (Node.js 18 أو أحدث، وffmpeg/ffprobe)، واتصال بالإنترنت، ومفتاح OpenAI API الخاص بك لعينات الصوت والتعليق الصوتي. وتحتاج كذلك تشغيل متصفح خفي للرندر؛ في المساعدين اللي بيشغّلوا الأوامر داخل sandbox لازم تسمح لهذه الأوامر بالعمل خارجه. أداة المتصفح تساعد في البحث عن الموسيقى؛ بدونها سيطلب منك المساعد تنزيل 2 إلى 4 مقطوعات من Pixabay بنفسك. المساعد النصي أو السحابي بدون وصول لجهازك يقدر يساعد في كتابة الحكاية بس، لا اختيار الصوت ولا رندر الفيديو.

## 1. OpenAI Codex

1. اختر المجلد الشخصي: `~/.agents/skills/agent-story-video/`.
2. نفّذ سطر نظامك ثم كتلة النسخ في الخطوة 2 أعلاه:

```sh
dest_parent="$HOME/.agents/skills"
```

```powershell
$destParent = Join-Path $HOME '.agents/skills'
```

3. في Codex CLI أو إضافة المحرر، اكتب `$agent-story-video` أو اخترها من `/skills`. في قائمة المهارات بتطبيق سطح المكتب اختر المهارة المثبّتة. البديل الخاص بمشروع: `.agents/skills/agent-story-video/`.

[الوثائق الرسمية](https://developers.openai.com/codex/skills/).

## 2. Claude Code

1. اختر المجلد الشخصي: `~/.claude/skills/agent-story-video/`.
2. نفّذ سطر نظامك ثم كتلة النسخ في الخطوة 2 أعلاه:

```sh
dest_parent="$HOME/.claude/skills"
```

```powershell
$destParent = Join-Path $HOME '.claude/skills'
```

3. اكتب `/agent-story-video` ثم طلبك. البديل الخاص بمشروع: `.claude/skills/agent-story-video/`. التثبيت المحلي لا يثبّتها تلقائيًا في Cowork أو الجلسات السحابية.

[الوثائق الرسمية](https://code.claude.com/docs/en/skills).

## 3. OpenClaw

1. من مجلد المستودع، نفّذ:

```sh
openclaw skills install ./skills/agent-story-video --as agent-story-video
openclaw skills list
openclaw skills check
```

2. راجع أي تنبيه ثقة دون تجاوزه تلقائيًا. تأكد أن التثبيت يستهدف مساحة عمل المساعد المطلوبة؛ اختر المساعد المهيأ عبر خيارات CLI الرسمية إذا كان لديك أكثر من واحد.
3. اطلب استخدام `agent-story-video` وتأكد من ظهورها. الـGateway البعيد يحتاج الملفات والأدوات في بيئته هو.

[الوثائق الرسمية](https://docs.openclaw.ai/cli/skills).

## 4. Hermes Agent

1. من الطرفية نفّذ:

```sh
hermes skills install eyoussef-builds/agent-story-video/skills/agent-story-video
```

2. راجع فحص المهارة المجتمعية واترك فحوص الأمان مفعّلة.
3. اطلب من Hermes عرض المهارات ثم استخدام `agent-story-video`. المجلد اليدوي الافتراضي `~/.hermes/skills/agent-story-video/`؛ قد يختلف مع ملف تعريف مخصص.

[الوثائق الرسمية](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills/).

## 5. Cursor

1. اختر المجلد الشخصي: `~/.cursor/skills/agent-story-video/`.
2. نفّذ سطر نظامك ثم كتلة النسخ في الخطوة 2 أعلاه:

```sh
dest_parent="$HOME/.cursor/skills"
```

```powershell
$destParent = Join-Path $HOME '.cursor/skills'
```

3. اكتب `/` في محادثة Agent واختر `agent-story-video`. البديل الخاص بمشروع: `.cursor/skills/agent-story-video/`. وصول المهارة الشخصية إلى عامل سحابي يحتاج مزامنة أو إعدادًا مدعومًا منفصلًا.

[الوثائق الرسمية](https://cursor.com/docs/skills).

## 6. Grok Bot

1. هذه **طريقة تكييف للتعليمات**، وليست ادعاءً بدعم استيراد `SKILL.md` الأصلي. افتح Bot وأرسل رابط هذا المستودع.
2. اطلب قراءة `skills/agent-story-video/SKILL.md` والمراجع المطلوبة، ثم حفظ طريقة العمل كمهارة خاصة باسم `agent-story-video`. احتفظ بالملفات المساعدة إذا كانت بيئة المساعد تدعمها.
3. افحص المهارة المحفوظة في إدارة الإضافات والمهارات الخاصة، وفعّلها للمساعد الحالي إن لزم ثم اخترها من `/` حيث يتوفر. إذا تعذرت قراءة المجلد، استخدم طريقة القراءة الصريحة في نهاية الدليل.

[الوثائق الرسمية](https://docs.x.ai/grok-bot/skills-routines-and-automations).

## 7. OpenCode

1. اختر المجلد الشخصي: `~/.config/opencode/skills/agent-story-video/`.
2. نفّذ سطر نظامك ثم كتلة النسخ في الخطوة 2 أعلاه:

```sh
dest_parent="$HOME/.config/opencode/skills"
```

```powershell
$destParent = Join-Path $HOME '.config/opencode/skills'
```

3. اطلب تحميل `agent-story-video` عبر أداة المهارات. البديل الخاص بمشروع: `.opencode/skills/agent-story-video/`. تأكد من ظهور الاسم وإمكانية قراءة المراجع.

[الوثائق الرسمية](https://opencode.ai/docs/skills/).

## 8. GitHub Copilot

1. اختر المجلد الشخصي: `~/.copilot/skills/agent-story-video/`.
2. نفّذ سطر نظامك ثم كتلة النسخ في الخطوة 2 أعلاه:

```sh
dest_parent="$HOME/.copilot/skills"
```

```powershell
$destParent = Join-Path $HOME '.copilot/skills'
```

3. استخدم وضع Agent محليًا في محرر مدعوم أو Copilot CLI واطلب `agent-story-video`. البديل الخاص بمشروع: `.github/skills/agent-story-video/`. يتأثر الاكتشاف بالإصدار وسياسة المؤسسة، ولا يقرأ المساعد السحابي ملفات جهازك تلقائيًا.

[الوثائق الرسمية](https://docs.github.com/en/copilot/concepts/customizations/agent-skills).

## 9. Gemini CLI

1. اختر المجلد الشخصي: `~/.gemini/skills/agent-story-video/`.
2. نفّذ سطر نظامك ثم كتلة النسخ في الخطوة 2 أعلاه:

```sh
dest_parent="$HOME/.gemini/skills"
```

```powershell
$destParent = Join-Path $HOME '.gemini/skills'
```

3. نفّذ `/skills list` داخل المساعد ثم اطلب استخدام `agent-story-video`. استخدم `/skills reload` عند الحاجة. البديل الخاص بمشروع: `.gemini/skills/agent-story-video/`. احتفظ بطلبات الموافقة المعتادة لتفعيل المهارة.

[الوثائق الرسمية](https://geminicli.com/docs/cli/skills/).

## 10. Windsurf / Cascade / Devin Desktop

1. اختر المجلد الشخصي: `~/.codeium/windsurf/skills/agent-story-video/`.
2. نفّذ سطر نظامك ثم كتلة النسخ في الخطوة 2 أعلاه:

```sh
dest_parent="$HOME/.codeium/windsurf/skills"
```

```powershell
$destParent = Join-Path $HOME '.codeium/windsurf/skills'
```

3. اطلب من Cascade تحميل `agent-story-video` وتأكد من ظهورها. الوثائق الحالية تنتقل إلى Devin Desktop؛ مجلد المشروع المفضل `.devin/skills/` مع استمرار `.windsurf/skills/` للتوافق. اختر المجلد المدعوم في إصدارك.

[الوثائق الرسمية](https://docs.windsurf.com/windsurf/cascade/skills).

## 11. Cline

1. اختر المجلد الشخصي: `~/.cline/skills/agent-story-video/`.
2. نفّذ سطر نظامك ثم كتلة النسخ في الخطوة 2 أعلاه:

```sh
dest_parent="$HOME/.cline/skills"
```

```powershell
$destParent = Join-Path $HOME '.cline/skills'
```

3. افتح Cline وتأكد من تفعيل المهارات في إصدارك ثم اطلب استخدام `agent-story-video`. البديل الخاص بمشروع: `.cline/skills/agent-story-video/`. استخدم وضعًا يتيح أدوات المهمة المطلوبة.

[الوثائق الرسمية](https://docs.cline.bot/customization/skills).

## 12. Roo Code

1. اختر المجلد الشخصي: `~/.roo/skills/agent-story-video/`.
2. نفّذ سطر نظامك ثم كتلة النسخ في الخطوة 2 أعلاه:

```sh
dest_parent="$HOME/.roo/skills"
```

```powershell
$destParent = Join-Path $HOME '.roo/skills'
```

3. اطلب من Roo تحميل `agent-story-video` بأداة المهارات. البديل الخاص بمشروع: `.roo/skills/agent-story-video/`. استخدم المجلد العام ما لم تكن تريد قصر المهارة على وضع معين.

[الوثائق الرسمية](https://roocodeinc.github.io/Roo-Code/advanced-usage/available-tools/skill/).

## 13. Aider

1. نستخدم **سياقًا للقراءة** بدل الادعاء بوجود تثبيت مهارات أصلي. من المستودع، نفّذ:

```sh
aider --read skills/agent-story-video/SKILL.md
```

2. أضف المراجع ذات الصلة بأمر `/read` مع مسار الملف داخل `skills/agent-story-video/references/`، وأضف البرامج المساعدة عند الحاجة.
3. اطلب اتباع المهارة، وأعطه فقط البيانات المسموح بها. قراءة النص لا تضيف أدوات محادثات أو متصفحًا أو خدمة صور أو صلاحية تنفيذ غير متاحة.

[الوثائق الرسمية](https://aider.chat/docs/usage/tips.html).

## 14. Amp

1. اختر المجلد الشخصي: `~/.agents/skills/agent-story-video/`.
2. نفّذ سطر نظامك ثم كتلة النسخ في الخطوة 2 أعلاه:

```sh
dest_parent="$HOME/.agents/skills"
```

```powershell
$destParent = Join-Path $HOME '.agents/skills'
```

3. اطلب من Amp عرض المهارات وتحميل `agent-story-video`. البديل الخاص بمشروع: `.agents/skills/agent-story-video/`. تأكد أن إعداداتك لم تعطّل اكتشاف المهارات العامة.

[الوثائق الرسمية](https://ampcode.com/docs/customize/skills).

## 15. Goose

1. اختر المجلد الشخصي: `~/.agents/skills/agent-story-video/`.
2. نفّذ سطر نظامك ثم كتلة النسخ في الخطوة 2 أعلاه:

```sh
dest_parent="$HOME/.agents/skills"
```

```powershell
$destParent = Join-Path $HOME '.agents/skills'
```

3. أبقِ إضافة Skills مفعّلة. افحص `goose skills list` ثم استخدم `/skills agent-story-video` داخل المحادثة. البديل الخاص بمشروع: `.agents/skills/agent-story-video/`. عمل الملفات والأوامر يحتاج إضافات أدوات مناسبة.

[الوثائق الرسمية](https://github.com/aaif-goose/goose/blob/main/documentation/docs/guides/context-engineering/using-skills.md).

## 3. تأكد أنها تعمل

1. افتح جلسة جديدة أو أعد تحميل المهارات إذا لم تظهر.
2. اسأل: «هل ترى مهارة `agent-story-video`؟ اقرأ تعليماتها وتأكد أن Node.js وffmpeg وgit مثبّتين هنا».
3. تحقق أنه يقرأ مجلد المهارة الكامل (ومعه `template/`) لا ملفًا آخر يحمل اسمًا مشابهًا.
4. استخدم طلب أول فيديو في [الشرح الرئيسي](../README.ar.md). إذا كانت أداة لازمة غير متاحة، يجب أن يوضح ذلك، لا أن يختلق نتيجة ناجحة.

## لأي مساعد آخر: قراءة صريحة

افتح المستودع أو نزّله في مساحة يستطيع المساعد قراءتها، ثم قل:

```text
اقرأ skills/agent-story-video/SKILL.md واتبع طريقة العمل لهذه المهمة.
اقرأ المراجع المرتبطة عند الحاجة وافحص البرامج قبل تشغيلها.
احترم صلاحياتي الحالية ووضّح أي أداة غير متاحة.
```

إذا كان المساعد نصيًا فقط، أرفق ملف التعليمات والمراجع الضرورية إن كان يدعم المرفقات. هذا يتيح كتابة الحكاية والتعليق، لا رندر الفيديوهات على جهازك.

## حل المشكلات

| المشكلة | ما الذي تفعله؟ |
| --- | --- |
| لا تظهر المهارة | افحص المجلد المدعوم وحالة الأحرف في `SKILL.md` وعدم وجود مجلد إضافي متداخل، ثم أعد تحميل المهارات. |
| لا تعمل تلقائيًا | اذكر اسمها صراحة أو استخدم طريقة الاستدعاء الخاصة بالمساعد. |
| النسخة المثبّتة قديمة | قارن النسخة الجديدة بالقديمة، واحفظ تعديلاتك (مثل `brand.json`) والملف الشخصي المحلي قبل التحديث. |
| توجد نسختان بنفس الاسم | اختر المكان المقصود وأزل النسخة المكررة بعد حفظ أي تعديلات. |
| المساعد السحابي لا يرى ملفاتك | استخدم بيئة محلية أو مصدرًا مسموحًا به متاحًا فعلًا؛ لا تفترض مزامنة تلقائية. |
| سياسة المؤسسة تمنع المهارات | راجع سياسة المؤسسة والطريقة المدعومة مع المسؤول؛ لا تتجاوز القيود. |
| تريد حذفها | احذف مجلد `agent-story-video` المثبّت فقط أو استخدم أداة الإزالة الخاصة بالمساعد، واترك ملفات مشاريعك كما هي. |

---

إعداد [eyoussef-builds](https://github.com/eyoussef-builds) · [hello@eyoussef.me](mailto:hello@eyoussef.me) · [eyoussef.me](https://eyoussef.me)
