import { useState } from 'react';
import { Check } from 'lucide-react';

type Theme = 'dark' | 'system';
type Language = 'en' | 'fr' | 'de' | 'es';

export default function SettingsView() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguage] = useState<Language>('en');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Appearance */}
      <Section title="Appearance">
        <Field label="Theme" description="Choose how Vision AI looks">
          <div className="flex gap-2">
            {(['dark', 'system'] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                  theme === t
                    ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Language" description="Display language for the interface">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="es">Español</option>
          </select>
        </Field>
      </Section>

      {/* Behavior */}
      <Section title="Behavior">
        <Field label="Notifications" description="Show analysis completion notifications">
          <Toggle value={notifications} onChange={setNotifications} />
        </Field>

        <Field label="Auto-save results" description="Automatically save every analysis to history">
          <Toggle value={autoSave} onChange={setAutoSave} />
        </Field>
      </Section>

      {/* Analysis */}
      <Section title="Model">
        <Field label="Detection model" description="Object detection model in use">
          <div className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300">
            Vision AI v1.0 — YOLO-style demo
          </div>
        </Field>

        <Field label="Confidence threshold" description="Minimum confidence to display a detection">
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={100}
              defaultValue={55}
              className="w-32 accent-violet-500"
            />
            <span className="text-sm text-white w-8">55%</span>
          </div>
        </Field>
      </Section>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
        >
          {saved && <Check className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="divide-y divide-gray-800">{children}</div>
    </div>
  );
}

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5.5 rounded-full transition-colors ${value ? 'bg-violet-600' : 'bg-gray-700'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4.5' : 'translate-x-0'}`}
      />
    </button>
  );
}
