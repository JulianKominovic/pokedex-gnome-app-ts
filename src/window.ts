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
        constructor(params: Partial<Adw.ActionRow.ConstructorProperties>) {
            super(params);

            const avatar = new Adw.Avatar();
            avatar.marginTop = 12;
            avatar.marginBottom = 12;
            avatar.size = 56;
            this.add_prefix(avatar);

            // I need to set avatar images from the resource file
            // I don't know how to do it
            // I tried this:

            const texture = Gdk.Texture.new_from_resource(
                '/com/jkominovic/pokedex/data/icons/hires/001.png'
            );

            avatar.set_custom_image(texture);

            // Pokemon sprites are located in data/icons/hires but I couldn't find a way to access them
            // I tried several things but I couldn't find a way to do it
            // I guess I'm missing some build configuration or something

            // Load the first Pokemon sprite image from the resource file
            // const spriteResourcePath =
            //     'com/jkominovic/pokedex/icons/hires/001.png';
            // const spriteBytes = Gio.resources_lookup_data(
            //     spriteResourcePath,
            //     0
            // );
            // const spritePixbuf = GdkPixbuf.Pixbuf.new_from_bytes(
            //     spriteBytes,
            //     null
            // );

            // Set the custom image for the avatar
            // avatar.set_custom_image(spritePixbuf);
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
        this._entry_pokemon_search.connect('changed', (e) => {
            console.log(e);
        });

        POKEMONS.forEach((pokemon) => {
            const item = new Item({
                title: pokemon.name.english,
                subtitle: `${pokemon.id} - ${pokemon.type.join(', ')}`,
            });
            this._pokemon_list.append(item);
        });
    }
}
