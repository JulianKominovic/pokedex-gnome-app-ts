import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gdk from 'gi://Gdk?version=4.0';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import { POKEMONS, TYPES } from './pokemon.js';
const Item = GObject.registerClass(
    {
        GTypeName: 'Item',
        InternalChildren: [],
    },
    class Item extends Adw.ActionRow {
        constructor({
            avatar_url,
            ...params
        }: Partial<Adw.ActionRow.ConstructorProperties> & {
            avatar_url: string;
        }) {
            super({ ...params, activatable: true });

            const imgWidget = new Gtk.Image();
            imgWidget.marginTop = 8;
            imgWidget.marginBottom = 8;
            imgWidget.pixel_size = 32;
            imgWidget.set_from_resource(avatar_url);
            imgWidget.set_css_classes(['test']);
            this.add_prefix(imgWidget);
        }
    }
);

class PokemonShowcase extends Gtk.Box {
    static {
        GObject.registerClass(
            {
                InternalChildren: [],
            },
            this
        );
    }

    constructor(pokemon: (typeof POKEMONS)[0], windowElement: Gtk.Box) {
        super({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 8,
        });
        windowElement.set_css_classes([
            `pokemon-${pokemon.id}`,
            'transition-background',
        ]);
        this.append(this.build_picture(pokemon));
        this.append(this.build_name(pokemon));
        this.append(this.build_types_badges(pokemon));
        this.append(this.build_species(pokemon));
        this.append(this.build_description(pokemon));
        this.append(this.build_stats_title());
        this.build_stats(pokemon)?.forEach((stat) => {
            this.append(stat);
        });
        this.append(this.build_versus_title());
        this.append(this.build_versus(pokemon));
    }

    build_picture(pokemon: (typeof POKEMONS)[0]) {
        const imgWidget = new Gtk.Image({
            margin_bottom: 8,
            margin_top: 8,
            pixel_size: 256,
            hexpand: true,
            halign: Gtk.Align.START,
        });
        imgWidget.set_from_resource(pokemon.image.sprite);
        imgWidget.set_css_classes(['test']);

        return imgWidget;
    }

    build_species(pokemon: (typeof POKEMONS)[0]) {
        const species = new Gtk.Label({
            label: pokemon.species,
            halign: Gtk.Align.START,
            hexpand: true,
            margin_top: 32,
            cssClasses: ['title-2'],
        });
        return species;
    }

    build_description(pokemon: (typeof POKEMONS)[0]) {
        const subtitle = new Gtk.Label({
            label: pokemon.description,
            halign: Gtk.Align.START,
            wrap: true,
            hexpand: true,
            cssClasses: ['dim-label'],
        });
        return subtitle;
    }

    build_name(pokemon: (typeof POKEMONS)[0]) {
        const title = new Gtk.Label({
            label: `${pokemon.name.english} - #${pokemon.id}`,
            halign: Gtk.Align.START,
            hexpand: true,
            cssClasses: ['title-1'],
        });

        return title;
    }

    build_types_badges(pokemon: (typeof POKEMONS)[0]) {
        const types = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            halign: Gtk.Align.START,
            hexpand: true,
            spacing: 8,
        });
        pokemon.type.forEach((type) => {
            const badge = new Gtk.Label({
                label: type,
                cssClasses: ['type', type.toLowerCase()],
            });
            types.append(badge);
        });
        return types;
    }

    build_stats_title() {
        const title = new Gtk.Label({
            label: 'Stats',
            halign: Gtk.Align.START,
            hexpand: true,
            margin_top: 32,
            margin_bottom: 8,
            cssClasses: ['title-2'],
        });
        return title;
    }

    build_stats(pokemon: (typeof POKEMONS)[0]) {
        if (!pokemon?.base) return null;
        const stats = pokemon?.base;
        return Object.entries(stats).map(([key, value]) => {
            const row = new Gtk.Box({
                orientation: Gtk.Orientation.VERTICAL,
                halign: Gtk.Align.FILL,
                hexpand: true,
                spacing: 8,
            });

            row.append(
                new Gtk.Label({
                    label: `${key} - ${Number(value)}`,
                    halign: Gtk.Align.START,
                    hexpand: true,
                    cssClasses: ['dim-label'],
                })
            );

            const bar_continuous = new Gtk.LevelBar({
                value: value,
                halign: Gtk.Align.FILL,
                minValue: 0,
                maxValue: 255,
                hexpand: true,
            });

            bar_continuous.add_offset_value('strong', 220);
            bar_continuous.add_offset_value('moderate', 140);
            bar_continuous.add_offset_value('weak', 100);
            bar_continuous.add_offset_value('very-weak', 50);
            row.append(bar_continuous);
            return row;
        });
    }

    build_versus_title() {
        const title = new Gtk.Label({
            label: 'Versus',
            halign: Gtk.Align.START,
            hexpand: true,
            margin_top: 32,
            margin_bottom: 8,
            cssClasses: ['title-2'],
        });
        return title;
    }

    build_versus(pokemon: (typeof POKEMONS)[0]) {
        const types = pokemon.type;
        const weakAgainstList: string[] = [];
        const strongAgainstList: string[] = [];
        const evenAgainstList: string[] = [];

        types.forEach((type) => {
            const matchingType = TYPES.find(
                (t) => t.english.toUpperCase() === type.toUpperCase()
            );
            const typeWeakAgainst = matchingType?.ineffective;
            const typeStrongAgainst = matchingType?.effective;
            const typeEvenAgainst = matchingType?.no_effect;

            typeWeakAgainst?.forEach((weakAgainst) => {
                if (!weakAgainstList.includes(weakAgainst)) {
                    weakAgainstList.push(weakAgainst);
                }
            });
            typeStrongAgainst?.forEach((strongAgainst) => {
                if (!strongAgainstList.includes(strongAgainst)) {
                    strongAgainstList.push(strongAgainst);
                }
            });
            typeEvenAgainst?.forEach((evenAgainst) => {
                if (!evenAgainstList.includes(evenAgainst)) {
                    evenAgainstList.push(evenAgainst);
                }
            });
        });

        const versus = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            halign: Gtk.Align.START,
            hexpand: true,
            spacing: 8,
        });

        // Weak list
        const weakAgainstBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            halign: Gtk.Align.START,
            hexpand: true,
            spacing: 8,
        });
        const weakAgainstTitle = new Gtk.Label({
            label: 'Weak against',
            halign: Gtk.Align.START,
            hexpand: true,
            cssClasses: ['title-4'],
        });
        weakAgainstBox.append(weakAgainstTitle);
        weakAgainstList.forEach((type) => {
            const badge = new Gtk.Label({
                label: type,
                cssClasses: ['type', type.toLowerCase()],
            });
            weakAgainstBox.append(badge);
        });

        // Strong list
        const strongAgainstBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            halign: Gtk.Align.START,
            hexpand: true,
            spacing: 8,
        });
        const strongAgainstTitle = new Gtk.Label({
            label: 'Strong against',
            halign: Gtk.Align.START,
            hexpand: true,
            cssClasses: ['title-4'],
        });
        strongAgainstBox.append(strongAgainstTitle);
        strongAgainstList.forEach((type) => {
            const badge = new Gtk.Label({
                label: type,
                cssClasses: ['type', type.toLowerCase()],
            });
            strongAgainstBox.append(badge);
        });

        // Even list
        const evenAgainstBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            halign: Gtk.Align.START,
            hexpand: true,
            spacing: 8,
        });
        const evenAgainstTitle = new Gtk.Label({
            label: 'Even against',
            halign: Gtk.Align.START,
            hexpand: true,
            cssClasses: ['title-4'],
        });
        evenAgainstBox.append(evenAgainstTitle);
        evenAgainstList.forEach((type) => {
            const badge = new Gtk.Label({
                label: type,
                cssClasses: ['type', type.toLowerCase()],
            });
            evenAgainstBox.append(badge);
        });

        versus.append(weakAgainstBox);
        versus.append(strongAgainstBox);
        versus.append(evenAgainstBox);

        return versus;
    }
}

/**
 * Windows are the top-level widgets in our application.
 * They hold all of the other widgets, and when a window is closed
 * all of them are destroyed (unless `hide-on-close` is set).
 *
 * For most cases, you will want to use an AdwApplicationWindow
 * as the parent class for your windows. GtkApplicationWindow and
 * AdwApplicationWindow both integrate with your Application class,
 * getting information about the application like the app ID and tying
 * the window and application's lifecycles together. In addition,
 * both of these classes allow you to directly add actions to them.
 * These actions will be prefixed with `win`.
 *
 * For more information on windows, see:
 *  - https://docs.gtk.org/gtk4/class.Window.html
 *  - https://docs.gtk.org/gtk4/class.ApplicationWindow.html
 *  - https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/class.ApplicationWindow.html
 */
export class Window extends Adw.ApplicationWindow {
    private _entry_pokemon_search!: Gtk.Entry;
    private _pokemon_list!: Gtk.ListBox;
    private _body!: Gtk.Box;
    private _window!: Gtk.Box;
    private _pokemon_detail!: PokemonShowcase;
    private _pokemon_details!: Adw.Clamp;

    static {
        /**
         * Here we use a template. We define the resource path to the .ui file
         * and the `id` of the objects we want to be able to access programmatically.
         *
         * For a detailed guide on how to use templates in GTK4,
         * see https://rmnvgr.gitlab.io/gtk4-gjs-book/application/ui-templates-composite-widgets/
         *
         * **IMPORTANT**: Above where you see `private _toastOverlay!: Adw.ToastOverlay;`
         * is where we actually declare the field. Template children are handled by GJS,
         * but we need to tell TypeScript that they exist. We prepend the underscore
         * so we match the name of the field that GJS will generate, and add
         * the exclamation point to tell the typescript compiler where to look.
         */
        GObject.registerClass(
            {
                Template: 'resource:///com/jkominovic/pokedex/window.ui',
                InternalChildren: [
                    'header_bar',
                    'pokemon_list',
                    'entry_pokemon_search',
                    'body',
                    'window',
                    'pokemon_details',
                ],
            },
            this
        );

        // Widgets allow you to directly add shortcuts to them when subclassing
        Gtk.Widget.add_shortcut(
            new Gtk.Shortcut({
                action: new Gtk.NamedAction({ action_name: 'window.close' }),
                trigger: Gtk.ShortcutTrigger.parse_string('<Control>w'),
            })
        );
    }

    constructor(params?: Partial<Adw.ApplicationWindow.ConstructorProperties>) {
        super(params);

        /**
         * Actions can also have parameters. In order to allow developers
         * to choose different types of parameters for their application,
         * we need to use something called a `GVariant`. When creating the
         * application we pass a string that denotes the type of the variant.
         *
         * For more information on variants, see:
         *  - https://docs.gtk.org/glib/struct.Variant.html
         *  - https://docs.gtk.org/glib/struct.VariantType.html
         */
        this._entry_pokemon_search.connect('changed', () => {
            const entry_text = this._entry_pokemon_search.get_text();
            this.build_pokemon_list(entry_text);
        });
        this.build_pokemon_details(POKEMONS[0]);
        this.build_pokemon_list();
    }

    private build_pokemon_details(pokemon: (typeof POKEMONS)[0]) {
        this._pokemon_detail = new PokemonShowcase(pokemon, this._window);
        this._pokemon_details.set_child(this._pokemon_detail);
    }

    private async build_pokemon_list(filterString?: string) {
        this._pokemon_list.remove_all();
        const filterWord = filterString?.toLocaleLowerCase();
        const pokemons = filterWord
            ? POKEMONS.filter(
                  (pokemon) =>
                      String(pokemon.id)
                          .toLocaleLowerCase()
                          .includes(filterWord) ||
                      pokemon.name.english
                          .toLocaleLowerCase()
                          .includes(filterWord)
              )
            : POKEMONS;
        pokemons.slice(0, 20).forEach((pokemon) => {
            const item = new Item({
                title: pokemon.name.english,
                subtitle: `${pokemon.id} - ${pokemon.type.join(', ')}`,
                avatar_url: pokemon.image.sprite,
            });
            item.connect('activated', () => {
                this.build_pokemon_details(pokemon);
            });
            this._pokemon_list.append(item);
        });
    }
}
