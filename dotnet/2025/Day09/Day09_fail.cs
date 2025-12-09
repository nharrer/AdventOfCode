using AdventOfCode;
using System.Data;

public class Year2025_Day09_fail(string inputPath) : Solvable($"{inputPath}/input_test1") {

    class Point(long x, long y) {
        public long x = x;
        public long y = y;
        public override string ToString() => $"P({x},{y})";
    }

    class Line(Point p1, Point p2) {
        public Point p1 = p1;
        public Point p2 = p2;
        public override string ToString() => $"L({p1.x},{p1.y}-{p2.x},{p2.y})";
    }

    class Area(Point p1, Point p2) {
        public Point p1 = p1;
        public Point p2 = p2;
        public override string ToString() => $"A({p1.x},{p1.y}-{p2.x},{p2.y})";
    }

    public override (object, object) Solve() {
        List<Point> tiles = [.. _inputLines.Select(p => {
            var coords = p.Split(',').Select(int.Parse).ToArray();
            return new Point(coords[0], coords[1]);
        })];

        long maxArea = 0;
        // for (int i = 0; i < tiles.Count; i++) {
        //     for (int j = i + 1; j < tiles.Count; j++) {
        //         var (tileA, tileB) = (tiles[i], tiles[j]);
        //         var area = Math.Abs(tileA.x - tileB.x + 1) * Math.Abs(tileA.y - tileB.y + 1);
        //         if (area > maxArea) {
        //             maxArea = area;
        //         }
        //     }
        // }

        long sol2 = solve2(tiles);

        return (maxArea, sol2);
    }

    private long solve2(List<Point> tiles) {
        long width = tiles.Max(t => t.x) + 1;
        long height = tiles.Max(t => t.y) + 1;

        // build lines
        var hlines = new List<Line>();
        var vlines = new List<Line>();
        for (int i = 0; i < tiles.Count; i++) {
            var p1 = tiles[i];
            var p2 = tiles[(i + 1) % tiles.Count];
            if (p1.y == p2.y) {
                if (p1.x > p2.x) {
                    hlines.Add(new Line(p2, p1));
                } else if (p2.x > p1.x) {
                    hlines.Add(new Line(p1, p2));
                } else {
                    throw new Exception("Dots are not supported!");
                }
            } else if (p1.x == p2.x) {
                if (p1.y > p2.y) {
                    vlines.Add(new Line(p2, p1));
                } else if (p2.y > p1.y) {
                    vlines.Add(new Line(p1, p2));
                } else {
                    throw new Exception("Dots are not supported!");
                }
            }
        }

        hlines.Sort((a, b) => a.p1.y.CompareTo(b.p1.y));
        vlines.Sort((a, b) => a.p1.x.CompareTo(b.p1.x));

        Console.WriteLine($"VLines: {vlines.Count}:");
        foreach (var vline in vlines) {
            Console.WriteLine(vline);
        }
        Console.WriteLine();

        HashSet<long> xValueSet = new();
        foreach (var hline in hlines) {
            xValueSet.Add(hline.p1.x);
            xValueSet.Add(hline.p2.x);
        }

        List<long> xValues = xValueSet.ToList();
        xValues.Sort();

        // Part 1: Build onAreas from vlines
        List<Area> onAreas = new();
        List<Line> onList = new();

        for (int xi = 0; xi < xValues.Count; xi++) {
            long x1 = xValues[xi];
            var vlines2 = vlines.Where(vl => vl.p1.x == x1).ToList();

            // Invert onList by vlines2 (XOR-like toggle of ranges)
            var newOnList = new List<Line>();
            foreach (var line in onList) {
                long lineStart = line.p1.y;
                long lineEnd = line.p2.y;
                // Subtract all vlines2 ranges from this line
                var segments = new List<(long start, long end)> { (lineStart, lineEnd) };
                foreach (var v in vlines2) {
                    long vStart = v.p1.y;
                    long vEnd = v.p2.y;
                    var newSegments = new List<(long start, long end)>();
                    foreach (var seg in segments) {
                        if (vEnd < seg.start || vStart > seg.end) {
                            // No overlap, keep segment
                            newSegments.Add(seg);
                        } else {
                            // Overlap: split segment
                            if (seg.start < vStart) {
                                newSegments.Add((seg.start, vStart));
                            }
                            if (seg.end > vEnd) {
                                newSegments.Add((vEnd, seg.end));
                            }
                        }
                    }
                    segments = newSegments;
                }
                foreach (var seg in segments) {
                    if (seg.start < seg.end) {
                        newOnList.Add(new Line(new Point(x1, seg.start), new Point(x1, seg.end)));
                    }
                }
            }

            // Add parts of vlines2 that are NOT covered by onList
            foreach (var v in vlines2) {
                long vStart = v.p1.y;
                long vEnd = v.p2.y;
                var segments = new List<(long start, long end)> { (vStart, vEnd) };
                foreach (var line in onList) {
                    long lineStart = line.p1.y;
                    long lineEnd = line.p2.y;
                    var newSegments = new List<(long start, long end)>();
                    foreach (var seg in segments) {
                        if (lineEnd < seg.start || lineStart > seg.end) {
                            // No overlap, keep segment
                            newSegments.Add(seg);
                        } else {
                            // Overlap: split segment
                            if (seg.start < lineStart) {
                                newSegments.Add((seg.start, lineStart));
                            }
                            if (seg.end > lineEnd) {
                                newSegments.Add((lineEnd, seg.end));
                            }
                        }
                    }
                    segments = newSegments;
                }
                foreach (var seg in segments) {
                    if (seg.start < seg.end) {
                        newOnList.Add(new Line(new Point(x1, seg.start), new Point(x1, seg.end)));
                    }
                }
            }

            // Merge overlapping segments
            newOnList.Sort((a, b) => a.p1.y.CompareTo(b.p1.y));
            var mergedOnList = new List<Line>();
            foreach (var line in newOnList) {
                if (mergedOnList.Count == 0) {
                    mergedOnList.Add(line);
                } else {
                    var lastLine = mergedOnList[mergedOnList.Count - 1];
                    if (line.p1.y <= lastLine.p2.y) {
                        // Overlapping or contiguous, merge
                        lastLine.p2.y = Math.Max(lastLine.p2.y, line.p2.y);
                    } else {
                        mergedOnList.Add(line);
                    }
                }
            }
            onList = mergedOnList;

            Console.WriteLine($"X={x1}:");
            foreach (var line in onList) {
                if (xi < xValues.Count - 1) {
                    long x2 = xValues[xi + 1];
                    onAreas.Add(new Area(new Point(x1, line.p1.y), new Point(x2, line.p2.y)));
                }
                Console.WriteLine($"  OnLine {line}");
            }
            Console.WriteLine();
        }

        foreach (var area in onAreas) {
            Console.WriteLine($"Area: ({area.p1.x},{area.p1.y}) - ({area.p2.x},{area.p2.y})");
        }
        Console.WriteLine();

        long maxArea = 0;
        for (int i = 0; i < tiles.Count; i++) {
            for (int j = i + 1; j < tiles.Count; j++) {
                Area a1 = new(tiles[i], tiles[j]);

                // Normalize a1 so p1 is top-left and p2 is bottom-right
                long minX = Math.Min(a1.p1.x, a1.p2.x);
                long maxX = Math.Max(a1.p1.x, a1.p2.x);
                long minY = Math.Min(a1.p1.y, a1.p2.y);
                long maxY = Math.Max(a1.p1.y, a1.p2.y);

                // Check if a1 is fully covered by onAreas
                // We need to verify that every part of a1 is inside some onArea
                var uncovered = new List<Area> { new Area(new Point(minX, minY), new Point(maxX, maxY)) };

                Console.WriteLine($"Checking a1 area ({minX},{minY})-({maxX},{maxY}) against onAreas");
                foreach (var onArea in onAreas) {
                    long onMinX = Math.Min(onArea.p1.x, onArea.p2.x);
                    long onMaxX = Math.Max(onArea.p1.x, onArea.p2.x);
                    long onMinY = Math.Min(onArea.p1.y, onArea.p2.y);
                    long onMaxY = Math.Max(onArea.p1.y, onArea.p2.y);

                    var newUncovered = new List<Area>();
                    foreach (var rect in uncovered) {
                        long rMinX = Math.Min(rect.p1.x, rect.p2.x);
                        long rMaxX = Math.Max(rect.p1.x, rect.p2.x);
                        long rMinY = Math.Min(rect.p1.y, rect.p2.y);
                        long rMaxY = Math.Max(rect.p1.y, rect.p2.y);

                        // Check for no overlap first (touching borders still count as overlap)
                        if (rMaxX < onMinX || rMinX > onMaxX || rMaxY < onMinY || rMinY > onMaxY) {
                            // Case 1: no overlap - keep the entire rect
                            newUncovered.Add(rect);
                        } else if (onMinX <= rMinX && onMaxX >= rMaxX && onMinY <= rMinY && onMaxY >= rMaxY) {
                            // Case 2: full overlap - rect is completely covered, don't add anything
                        } else if (onMinX <= rMinX && onMaxX >= rMaxX && onMinY <= rMinY && onMaxY < rMaxY) {
                            // Case 3: top overlap - bottom part remains
                            newUncovered.Add(new Area(new Point(rMinX, onMaxY), new Point(rMaxX, rMaxY)));
                        } else if (onMinX <= rMinX && onMaxX >= rMaxX && onMinY > rMinY && onMaxY >= rMaxY) {
                            // Case 4: bottom overlap - top part remains
                            newUncovered.Add(new Area(new Point(rMinX, rMinY), new Point(rMaxX, onMinY)));
                        } else if (onMinX <= rMinX && onMaxX < rMaxX && onMinY <= rMinY && onMaxY >= rMaxY) {
                            // Case 5: left overlap - right part remains
                            newUncovered.Add(new Area(new Point(onMaxX, rMinY), new Point(rMaxX, rMaxY)));
                        } else if (onMinX > rMinX && onMaxX >= rMaxX && onMinY <= rMinY && onMaxY >= rMaxY) {
                            // Case 6: right overlap - left part remains
                            newUncovered.Add(new Area(new Point(rMinX, rMinY), new Point(onMinX, rMaxY)));
                        } else if (onMinX <= rMinX && onMaxX < rMaxX && onMinY <= rMinY && onMaxY < rMaxY) {
                            // Case 7: top-left overlap - right and bottom parts remain (L-shape)
                            newUncovered.Add(new Area(new Point(onMaxX, rMinY), new Point(rMaxX, rMaxY))); // right
                            newUncovered.Add(new Area(new Point(rMinX, onMaxY), new Point(onMaxX, rMaxY))); // bottom-left
                        } else if (onMinX > rMinX && onMaxX >= rMaxX && onMinY <= rMinY && onMaxY < rMaxY) {
                            // Case 8: top-right overlap - left and bottom parts remain (L-shape)
                            newUncovered.Add(new Area(new Point(rMinX, rMinY), new Point(onMinX, rMaxY))); // left
                            newUncovered.Add(new Area(new Point(onMinX, onMaxY), new Point(rMaxX, rMaxY))); // bottom-right
                        } else if (onMinX <= rMinX && onMaxX < rMaxX && onMinY > rMinY && onMaxY >= rMaxY) {
                            // Case 9: bottom-left overlap - top and right parts remain (L-shape)
                            newUncovered.Add(new Area(new Point(rMinX, rMinY), new Point(rMaxX, onMinY))); // top
                            newUncovered.Add(new Area(new Point(onMaxX, onMinY), new Point(rMaxX, rMaxY))); // right
                        } else if (onMinX > rMinX && onMaxX >= rMaxX && onMinY > rMinY && onMaxY >= rMaxY) {
                            // Case 10: bottom-right overlap - top and left parts remain (L-shape)
                            newUncovered.Add(new Area(new Point(rMinX, rMinY), new Point(rMaxX, onMinY))); // top
                            newUncovered.Add(new Area(new Point(rMinX, onMinY), new Point(onMinX, rMaxY))); // left
                        } else if (onMinX > rMinX && onMaxX < rMaxX && onMinY > rMinY && onMaxY < rMaxY) {
                            // Case 11: inside overlap - onArea is completely inside rect, creates 4 parts
                            newUncovered.Add(new Area(new Point(rMinX, rMinY), new Point(rMaxX, onMinY))); // top
                            newUncovered.Add(new Area(new Point(rMinX, onMaxY), new Point(rMaxX, rMaxY))); // bottom
                            newUncovered.Add(new Area(new Point(rMinX, onMinY), new Point(onMinX, onMaxY))); // left
                            newUncovered.Add(new Area(new Point(onMaxX, onMinY), new Point(rMaxX, onMaxY))); // right
                        } else {
                            // Other partial overlaps - use general splitting approach
                            // Left strip
                            if (rMinX < onMinX) {
                                newUncovered.Add(new Area(new Point(rMinX, rMinY), new Point(onMinX, rMaxY)));
                            }
                            // Right strip
                            if (rMaxX > onMaxX) {
                                newUncovered.Add(new Area(new Point(onMaxX, rMinY), new Point(rMaxX, rMaxY)));
                            }
                            // Top strip (within x-overlap)
                            long overlapX1 = Math.Max(rMinX, onMinX);
                            long overlapX2 = Math.Min(rMaxX, onMaxX);
                            if (rMinY < onMinY) {
                                newUncovered.Add(new Area(new Point(overlapX1, rMinY), new Point(overlapX2, onMinY)));
                            }
                            // Bottom strip (within x-overlap)
                            if (rMaxY > onMaxY) {
                                newUncovered.Add(new Area(new Point(overlapX1, onMaxY), new Point(overlapX2, rMaxY)));
                            }
                        }
                    }
                    uncovered = newUncovered;

                    if (uncovered.Count == 0) {
                        break;
                    }
                }
                if (uncovered.Count == 0) {
                    Console.WriteLine($"  Fully covered!");
                } else {
                    Console.WriteLine($"  Uncovered parts:");
                    foreach (var rect in uncovered) {
                    Console.WriteLine($"    ({rect.p1.x},{rect.p1.y})-({rect.p2.x},{rect.p2.y})");
                    }
                }

                // If nothing is uncovered, a1 is fully inside onAreas
                if (uncovered.Count == 0) {
                    long area = (maxX - minX) * (maxY - minY);
                    if (area > maxArea) {
                        maxArea = area;
                    }
                }
            }
        }

        return maxArea;
    }
}
