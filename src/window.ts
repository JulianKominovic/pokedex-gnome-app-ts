import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Gdk from 'gi://Gdk?version=4.0';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk?version=4.0';
import { POKEMONS } from './pokemon.js';
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
            imgWidget.marginTop = 12;
            imgWidget.marginBottom = 12;
            imgWidget.pixel_size = 64;
            imgWidget.set_from_resource(avatar_url);
            this.add_prefix(imgWidget);
        }
    }
);

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
        this._entry_pokemon_search.connect('changed', (...args) => {
            const entry_text = this._entry_pokemon_search.get_text();
            this.build_pokemon_list(entry_text);
        });
    }

    private async build_pokemon_list(filterString: string) {
        this._pokemon_list.remove_all();
        const filterWord = filterString.toLocaleLowerCase();
        const pokemons = filterString
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
        pokemons.slice(0, 10).forEach((pokemon) => {
            const item = new Item({
                title: pokemon.name.english,
                subtitle: `${pokemon.id} - ${pokemon.type.join(', ')}`,
                avatar_url: pokemon.image.sprite,
            });
            this._pokemon_list.append(item);
        });
    }
}
