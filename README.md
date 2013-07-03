# Oversight

Oversight is a Mac dashboard widget that lets you keep an eye on applications. It displays the top five consumers of processor time or memory space, along with system uptime at a glance.

## Installation

Download the latest version from the [releases page](https://github.com/alexdahl/oversight/releases), and just open `Oversight.wdgt` in the Finder to install. OS X will move the file to `~/Library/` and open the widget in Dashboard.

## Multi-core Reporting

The CPU value shown is the percentage of CPU time a process is using of its core. A process reporting 100% usage has maxed out only its core, not the entire processor. (For example, a quad-core system supports a theoretical maximum of 400% CPU time – 4 processes each using 100% of their cores.)

## Collaboration

When maintaining a separate fork, it's best to change the bundle identifier to avoid preference conflicts. In `Info.plist`, change the `CFBundleIdentifier` and version keys to your own values.

## License

Oversight is released under the [MIT License](http://www.opensource.org/licenses/MIT), which allows you to modify and redistribute this software freely.
