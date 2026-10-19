import { createRoot } from 'react-dom/client';
import App from './App';
import {LocaleProvider} from './i18n';
import {PyPreferencesProvider} from './components/py/PyPreferences';
import './styles.css';
import './styles/discovery.css';
import './styles/studio.css';

createRoot(document.getElementById('root')!).render(<LocaleProvider><PyPreferencesProvider><App /></PyPreferencesProvider></LocaleProvider>);
