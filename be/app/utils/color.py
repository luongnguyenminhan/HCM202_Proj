"""
Lightweight colored printing utilities for quick debugging.
Minimal API, keep docstrings short.
"""

from typing import Optional


ANSI_RESET = '\033[0m'
ANSI_STYLES = {
	'bold': '\033[1m',
}

ANSI_COLORS = {
	'gray': '\033[90m',
	'red': '\033[31m',
	'green': '\033[32m',
	'yellow': '\033[33m',
	'blue': '\033[34m',
	'magenta': '\033[35m',
	'cyan': '\033[36m',
	'white': '\033[37m',
}


def colorize(text: str, color: Optional[str] = None, *, bold: bool = False) -> str:
	"""Return text wrapped with ANSI color/style codes."""
	parts: list[str] = []
	if bold:
		parts.append(ANSI_STYLES['bold'])
	if color:
		code = ANSI_COLORS.get(color.lower())
		if code:
			parts.append(code)
	if not parts:
		return text
	return f'{"".join(parts)}{text}{ANSI_RESET}'


def color_print(
	message: str,
	color: Optional[str] = None,
	*,
	bold: bool = False,
	prefix: Optional[str] = None,
	end: str = '\n',
) -> None:
	"""Print a message with optional color/style and prefix."""
	formatted = message
	if prefix:
		formatted = f'[{prefix}] {formatted}'
	print(colorize(formatted, color=color, bold=bold), end=end)


def print_debug(message: str) -> None:
	"""Cyan debug line."""
	color_print(message, color='cyan', prefix='DEBUG')


def print_info(message: str) -> None:
	"""Blue info line."""
	color_print(message, color='blue', prefix='INFO')


def print_success(message: str) -> None:
	"""Green success line."""
	color_print(message, color='green', prefix='OK')


def print_warning(message: str) -> None:
	"""Yellow warning line."""
	color_print(message, color='yellow', prefix='WARN')


def print_error(message: str) -> None:
	"""Red error line (bold)."""
	color_print(message, color='red', bold=True, prefix='ERROR')


def print_color(message: str, color: str) -> None:
	"""Alias: print message with color."""
	color_print(message, color=color)


def printc(message: str, color: str) -> None:
	"""Short alias for quick debug typing."""
	color_print(message, color=color)
