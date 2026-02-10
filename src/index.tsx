import { render } from "preact";
import { LocationProvider, Router, Route } from "preact-iso";

import "./style.css";
import { Header } from "./components/Header.jsx";
import NotFoundPage from "./pages/_404.jsx";
import HomePage from "./pages/home";
import RicePage from "./pages/rice";
import { AppState, createAppState } from "./lib/appState";
import { ModalConsumer } from "./components/ModalConsumer";
import { NotificationConsumer } from "./components/NotificationConsumer";
import { AccountPage } from "./pages/account";

export function App() {
    // const [theme, setTheme] = useState<"default" | "everforest">("default");

    // useEffect(() => {
    //     document.documentElement.className = `theme-${theme}`;
    // }, [theme]);

    return (
        <LocationProvider>
            <AppState.Provider value={createAppState()}>
                <Header />
                <main className="m-4">
                    <Router>
                        <Route path="/" component={HomePage} />
                        <Route path="/:username/:slug" component={RicePage} />
                        <Route path="/account" component={AccountPage} />
                        <Route default component={NotFoundPage} />
                    </Router>
                    <ModalConsumer />
                    <NotificationConsumer />
                </main>
            </AppState.Provider>
        </LocationProvider>
    );
}

render(<App />, document.getElementById("app"));
