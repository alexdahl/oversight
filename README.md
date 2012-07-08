# Oversight

Oversight is a Mac dashboard widget that lets you keep an eye on applications. It displays the top five consumers of processor or memory, along with system uptime at a glance.

## Installation

Download the latest stable release from the [tags page](https://github.com/alexdahl/oversight/tags). Then just open `Oversight.wdgt` from the Finder to install. OS X will move the file to `~/Library/` and open the widget in Dashboard.

## Collaboration

When maintaining a separate fork, it's best to change the bundle identifier to avoid preference conflicts. In `Info.plist`, change the `CFBundleIdentifier` and version keys to your own values.

## License

Oversight is release under the [MIT License](http://www.opensource.org/licenses/MIT), which allows you to modify and redistribute this software freely.