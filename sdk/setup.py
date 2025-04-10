from setuptools import setup, find_packages

setup(
    name="neptuno-sdk",
    version="0.1.0",
    description="SDK oficial de Neptuno para integraciones Python",
    author="Vinxenxo Dev",
    author_email="tu_email@ejemplo.com",
    packages=find_packages(include=["sdk", "sdk.*"]),
    install_requires=[
        "httpx>=0.26.0",
        "pydantic>=2.0.0",
        "pydantic-settings>=2.0.0"
    ],
    python_requires=">=3.8",
    entry_points={
        "console_scripts": [
            "neptuno=sdk.__main__:main"
        ]
    }
)
