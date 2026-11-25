package main

// REVIEW.md restates repo facts for reviewers; a stale claim there is
// invisible, so pin it.

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
	"unicode/utf16"

	"github.com/goccy/go-yaml"
)

const (
	reviewPath     = "REVIEW.md"
	ciWorkflowPath = ".github/workflows/ci.yml"
)

func readRepoFile(t *testing.T, path string) string {
	t.Helper()
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("read %s: %v", path, err)
	}
	return string(b)
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	var b []byte
	for n > 0 {
		b = append([]byte{byte('0' + n%10)}, b...)
		n /= 10
	}
	return string(b)
}

// REVIEW.md tells the reviewer which CI job proves what, and which skip gates
// mean a green run proved nothing. Both go stale silently on a rename.
func TestReviewNamesRealCIJobsAndGates(t *testing.T) {
	doc := readRepoFile(t, reviewPath)
	ci := readRepoFile(t, ciWorkflowPath)
	// Hyphenated only: a single-word job name is indistinguishable from prose.
	jobs := regexp.MustCompile("`([a-z0-9]+(?:-[a-z0-9]+)+)`").FindAllStringSubmatch(doc, -1)
	if len(jobs) < 2 {
		t.Fatalf("expected %s to name at least 2 CI jobs in backticks, found %d", reviewPath, len(jobs))
	}
	for _, j := range jobs {
		t.Run(j[1], func(t *testing.T) {
			if !strings.Contains(ci, "\n  "+j[1]+":\n") {
				t.Errorf("%s names a CI job %q that %s does not define", reviewPath, j[1], ciWorkflowPath)
			}
		})
	}
	for _, g := range regexp.MustCompile("`((?:XUI|XRAY)_[A-Z0-9_]+)`").FindAllStringSubmatch(doc, -1) {
		t.Run(g[1], func(t *testing.T) {
			if strings.Contains(ci, g[1]) {
				t.Errorf("%s claims %s is never set in CI, but %s sets it", reviewPath, g[1], ciWorkflowPath)
			}
		})
	}
}

// The i18n rule is the one REVIEW.md states as a number, so it is the one that
// goes wrong silently when a locale is added.
func TestReviewLocaleFileCount(t *testing.T) {
	doc := readRepoFile(t, reviewPath)
	m := regexp.MustCompile(`(\d+) locale files`).FindStringSubmatch(doc)
	if m == nil {
		t.Fatalf("%s no longer states the i18n rule as \"N locale files\"", reviewPath)
	}
	files, err := filepath.Glob("internal/web/translation/*.json")
	if err != nil {
		t.Fatalf("glob locales: %v", err)
	}
	if got := len(files); m[1] != itoa(got) {
		t.Errorf("%s tells the reviewer to expect %s locale files, internal/web/translation/ holds %d", reviewPath, m[1], got)
	}
}

// GitHub rejects the whole workflow once a value holding ${{ }} passes 21,000
// characters, so every trigger fails with no job to read; actionlint misses it.
func TestBotPromptsFitGitHubExpressionLimit(t *testing.T) {
	const limit = 21000
	files, err := filepath.Glob(".github/workflows/claude-*.yml")
	if err != nil || len(files) == 0 {
		t.Fatalf("glob bot workflows: %v (%d files)", err, len(files))
	}
	checked := 0
	for _, path := range files {
		var wf struct {
			Jobs map[string]struct {
				Steps []struct {
					With map[string]any `yaml:"with"`
				} `yaml:"steps"`
			} `yaml:"jobs"`
		}
		if err := yaml.Unmarshal([]byte(readRepoFile(t, path)), &wf); err != nil {
			t.Fatalf("parse %s: %v", path, err)
		}
		for job, j := range wf.Jobs {
			for _, step := range j.Steps {
				for key, v := range step.With {
					s, ok := v.(string)
					if !ok || !strings.Contains(s, "${{") {
						continue
					}
					checked++
					// GitHub counts .NET string length: UTF-16 code units.
					if n := len(utf16.Encode([]rune(s))); n > limit {
						t.Errorf("%s job %s with.%s is %d characters; GitHub rejects the workflow over %d", path, job, key, n, limit)
					}
				}
			}
		}
	}
	if checked == 0 {
		t.Fatal("no ${{ }} value found in the bot workflows: the parse no longer reaches the prompts")
	}
}
